import { WebSocket, WebSocketServer } from "ws";
import { ZodError } from "zod";
import { GameManager } from "./GameManager";
import { AuthMessage, AuthMessageSchema, MessageSchema, RoomCode, WsMessage } from "./Schemas";
import { UserID } from "./types";
import { broadcastMessageToRoom, sendMessage } from "./utils";

export interface AuthedSocket extends WebSocket {
  id: string;
  userId?: UserID;
  isAuthenticated: boolean;
  isHostingGame?: RoomCode;
  isPlayingGame?: RoomCode;
}

export class WebSocketManager {
  private connections = new Map<UserID, WebSocket>();
  private server: WebSocketServer;
  private gameManager: GameManager;

  /**
   *
   */
  constructor(server: WebSocketServer, gameManager: GameManager) {
    this.server = server;
    this.gameManager = gameManager;
    this.initializeServer();
  }

  initializeServer = () => {
    this.server.on("connection", (socket: AuthedSocket) => this.initializeSocket(socket));

    this.server.on("error", (error) => {
      console.error("WebSocket Server Error:", error);
    });
  };

  initializeSocket = (socket: AuthedSocket) => {
    socket.id = crypto.randomUUID();
    socket.isAuthenticated = false;
    sendMessage("Message", { message: "Authenticate Yourself" }, socket);
    socket.once("message", (data: AuthMessage) => this.handleAuthentication(socket, data));

    socket.on("error", (error) => {
      console.error(error);
    });

    socket.on("close", () => {
      if (socket.isPlayingGame || socket.isHostingGame) {
        const roomCode = socket.isHostingGame || socket.isPlayingGame;
        const game = this.gameManager.getGame(roomCode!);
        game?.removePlayer(socket.userId!);
        broadcastMessageToRoom("Notification", { message: `Player left - ${socket.userId}` }, game!.getPlayers());
      }
      this.cleanUpSocket(socket);
    });
  };

  private addWebsocket = (id: string, socket: WebSocket) => {
    this.connections.set(id, socket);
  };
  getWebsocket = (id: string): WebSocket | undefined => {
    return this.connections.get(id);
  };
  private removeSocket = (id: string): void => {
    this.connections.delete(id);
  };

  private cleanUpSocket = (socket: AuthedSocket) => {
    if (socket.userId) {
      this.removeSocket(socket.userId);
    }
  };
  listWebSockets = (): string[] => {
    return [...this.connections.keys()];
  };

  totalClients = (): number => {
    return this.server.clients.size;
  };

  broadcastMessage = (authenticatedOnly: boolean = false) => {
    if (authenticatedOnly) {
      [...this.connections.values()].forEach((socket) => {
        sendMessage("Message", { message: "Hello authenticated sir!" }, socket);
      });
    } else {
      this.server.clients.forEach((socket) => {
        sendMessage("Message", { message: "Hello sir!" }, socket);
      });
    }
  };

  private attachMessageHandler = (socket: AuthedSocket) => {
    socket.on("message", (data: WsMessage) => {
      if (!socket.isAuthenticated) {
        throw new Error("Unauthenticated Socket");
      }
      try {
        const parsedMessage = JSON.parse(data.toString());
        MessageSchema.parse(parsedMessage);
        // sendMessage("Message", { message: "Message received!" }, socket);
        this.gameManager.handleMessage(socket, parsedMessage);
      } catch (error) {
        this.handleError("onMessage", socket, error);
      }
    });
  };

  private handleAuthentication = (socket: AuthedSocket, data: AuthMessage) => {
    try {
      const parsed = JSON.parse(data.toString());
      const validatedMessage = AuthMessageSchema.parse(parsed);
      const { userId, token } = validatedMessage.payload;
      if ([...this.connections.keys()].includes(userId)) {
        throw new Error("User already exists");
      }
      // TODO: Validate token here

      // --
      // Once validated
      socket.isAuthenticated = true;
      socket.userId = userId;
      this.addWebsocket(userId, socket);
      sendMessage("Success", { message: `Authentication Successful - Welcome to the server ${userId}` }, socket);

      // Attach the onMessage event listener once user is validated
      this.attachMessageHandler(socket);
    } catch (error) {
      this.handleError("onceMessage", socket, error);
      socket.close();
    }
  };

  private handleError = (type: "onMessage" | "onceMessage", socket: WebSocket, error: any) => {
    const message = error.message;
    switch (type) {
      case "onMessage":
        if (error instanceof ZodError) {
          const errorMessage = JSON.stringify(error.issues);
          sendMessage("Error", { message: "Invalid payload! - " + errorMessage }, socket);
          return;
        }
        sendMessage("Error", { message }, socket);
        break;
      case "onceMessage":
        sendMessage("Error", { message: "Authentication failed" }, socket);
        break;
      default:
        sendMessage("Error", { message: "Internal server Error! - " + message }, socket);
        break;
    }
  };
}
