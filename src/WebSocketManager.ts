import { WebSocket, WebSocketServer } from "ws";
import {
  AuthMessage,
  AuthMessageSchema,
  MessageSchema,
  WsMessage,
} from "./Schemas";
import { handleError } from ".";

export interface AuthedSocket extends WebSocket {
  id: string;
  userId?: string;
  isAuthenticated: boolean;
}

export class WebSocketManager {
  private connections: Map<string, WebSocket>;
  private server: WebSocketServer;

  /**
   *
   */
  constructor(server: WebSocketServer) {
    this.connections = new Map();
    this.server = server;
    this.server.on("connection", (socket: AuthedSocket) => {
      socket.id = crypto.randomUUID();
      socket.isAuthenticated = false;
      socket.send(
        JSON.stringify({ type: "Message", Message: "Authenticate Yourself" })
      );
      socket.once("message", (data: AuthMessage) =>
        this.handleAuthentication(socket, data)
      );

      socket.on("error", (error) => {
        console.error(error);
      });

      socket.on("close", () => {
        const userId = socket.userId;
        if (!userId) {
          return;
        }
        this.removeSocket(userId);
      });
    });
  }

  addWebsocket = (id: string, socket: WebSocket) => {
    this.connections.set(id, socket);
  };
  getWebsocket = (id: string): WebSocket | undefined => {
    return this.connections.get(id);
  };
  removeSocket = (id: string): void => {
    this.connections.delete(id);
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
        return;
      }
      try {
        const parsed = JSON.parse(data.toString());
        MessageSchema.parse(parsed);
        socket.send("Message received!");
      } catch (error) {
        handleError("onMessage", socket, error);
      }
    });
  };

  private handleAuthentication = (socket: AuthedSocket, data: AuthMessage) => {
    try {
      const parsed = JSON.parse(data.toString());
      const validatedMessage = AuthMessageSchema.parse(parsed);
      const { userId, token } = validatedMessage.payload;
      // TODO: Validate token here

      // --
      // Once validated
      socket.isAuthenticated = true;
      socket.userId = userId;
      this.addWebsocket(userId, socket);
      socket.send(
        `Authentication Successful - Welcome to the server ${userId}`
      );

      // Attach the on message event listener once user is validated
      this.attachMessageHandler(socket);
    } catch (error) {
      handleError("onceMessage", socket, error);
      socket.close();
    }
  };
}
