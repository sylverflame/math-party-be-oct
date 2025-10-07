import { WebSocket, WebSocketServer } from "ws";
import { AuthMessage, AuthMessageSchema, MessageSchema, RoomCode, WsMessage } from "./Schemas";
import { ZodError } from "zod";
import { UserID } from "./types";
import { GameManager } from "./GameManager";
import { Game } from "./Game";

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
    socket.send(JSON.stringify({ type: "Message", Message: "Authenticate Yourself" }));
    socket.once("message", (data: AuthMessage) => this.handleAuthentication(socket, data));

    socket.on("error", (error) => {
      console.error(error);
    });

    socket.on("close", () => {
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
        socket.send("Hello authenticated sir!");
      });
    } else {
      this.server.clients.forEach((socket) => {
        socket.send("Hello sir!");
      });
    }
  };

  private attachMessageHandler = (socket: AuthedSocket) => {
    socket.on("message", (data: WsMessage) => {
      if (!socket.isAuthenticated) {
        throw new Error("Error: Unauthenticated Socket")
      }
      try {
        const parsedMessage = JSON.parse(data.toString());
        MessageSchema.parse(parsedMessage);
        socket.send("Message received!");
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
      socket.send(`Authentication Successful - Welcome to the server ${userId}`);

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
          socket.send("Invalid payload! - " + errorMessage);
          return;
        }
        socket.send(JSON.stringify({ type: "Error", message }));
        break;
      case "onceMessage":
        socket.send(JSON.stringify({ type: "Error", message: "Authentication failed" }));
        break;
      default:
        socket.send(JSON.stringify({ type: "Error", message: "Internal server Error! - " + message }));
        break;
    }
  };
}
