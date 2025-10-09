import { EventEmitter } from "events";
import { WebSocket, WebSocketServer } from "ws";
import { ZodError } from "zod";
import { GameManager } from "./GameManager";
import { AuthPayloadSchema, CreateGamePayloadSchema, IncomingMessageSchema, JoinLeavePayloadSchema, RoomCode } from "./Schemas";
import { ErrorCodes, GameManagerEvents, OutgoingMessageTypes, SocketManagerEvents, UserID } from "./types";

export interface AuthedSocket extends WebSocket {
  id: string;
  userId?: UserID;
  isAuthenticated: boolean;
  isHostingGame?: RoomCode;
  isPlayingGame?: RoomCode;
}

export class WebSocketManager {
  private connections = new Map<UserID, AuthedSocket>();
  private server: WebSocketServer;
  private eventEmitter: EventEmitter;

  constructor(server: WebSocketServer, eventEmitter: EventEmitter) {
    this.server = server;
    this.eventEmitter = eventEmitter;
    this.initializeServer();
    this.addEventListeners();
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
    this.sendMessageToSocket(OutgoingMessageTypes.MESSAGE, { message: "Authenticate Yourself" }, socket);
    socket.once("message", (data: any) => this.handleAuthentication(socket, data));

    socket.on("error", (error) => {
      console.error(error);
    });

    socket.on("close", () => {
      if (socket.isPlayingGame || socket.isHostingGame) {
        this.eventEmitter.emit(SocketManagerEvents.PLAYER_DISCONNECTED, socket.userId, socket.isPlayingGame || socket.isHostingGame);
      }
      this.cleanUpSocket(socket);
    });
  };

  private addWebsocket = (id: string, socket: AuthedSocket) => {
    this.connections.set(id, socket);
  };
  getWebsocket = (id: string): AuthedSocket | undefined => {
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

  broadcastMessageToAllClients = (authenticatedOnly: boolean = false) => {
    if (authenticatedOnly) {
      [...this.connections.values()].forEach((socket) => {
        this.sendMessageToSocket(OutgoingMessageTypes.MESSAGE, { message: "Hello authenticated sir!" }, socket);
      });
    } else {
      this.server.clients.forEach((socket) => {
        this.sendMessageToSocket(OutgoingMessageTypes.MESSAGE, { message: "Hello sir!" }, socket as AuthedSocket);
      });
    }
  };

  private attachMessageHandler = (socket: AuthedSocket) => {
    socket.on("message", (data: any) => {
      if (!socket.isAuthenticated) {
        throw new Error("Unauthenticated Socket");
      }
      try {
        const jsonData = JSON.parse(data.toString());
        const { type, payload } = IncomingMessageSchema.parse(jsonData);
        const { userId } = socket;
        if (type === SocketManagerEvents.CREATE_GAME) {
          const { settings } = CreateGamePayloadSchema.parse(payload);
          this.eventEmitter.emit(SocketManagerEvents.CREATE_GAME, userId, settings);
        }

        if (type === SocketManagerEvents.JOIN_ROOM) {
          if (socket.isPlayingGame || socket.isHostingGame) {
            throw new Error("Player is in another game");
          }
          const { roomCode } = JoinLeavePayloadSchema.parse(payload);
          this.eventEmitter.emit(SocketManagerEvents.JOIN_ROOM, userId, roomCode);
        }

        if (type === SocketManagerEvents.LEAVE_ROOM) {
          const { roomCode } = JoinLeavePayloadSchema.parse(payload);
          this.eventEmitter.emit(SocketManagerEvents.LEAVE_ROOM, userId, roomCode);
        }
      } catch (error) {
        this.handleError("onMessage", socket, error);
      }
    });
  };

  private handleAuthentication = (socket: AuthedSocket, data: any) => {
    try {
      const jsonData = JSON.parse(data.toString());
      const { type, payload } = IncomingMessageSchema.parse(jsonData);
      if (type !== "AUTHENTICATE_USER") {
        throw new Error(ErrorCodes.ERR_001);
      }
      const { userId, token } = AuthPayloadSchema.parse(payload);
      if ([...this.connections.keys()].includes(userId)) {
        throw new Error("User already exists");
      }
      // TODO: Validate token here

      // --
      // Once validated
      socket.isAuthenticated = true;
      socket.userId = userId;
      this.addWebsocket(userId, socket);
      this.sendMessageToSocket(OutgoingMessageTypes.SUCCESS, { message: `Authentication Successful - Welcome to the server ${userId}` }, socket);

      // Attach the onMessage event listener once user is validated
      this.attachMessageHandler(socket);
    } catch (error) {
      this.handleError("onceMessage", socket, error);
      socket.close(4001, "Unauthorized Access");
    }
  };

  private handleError = (type: "onMessage" | "onceMessage", socket: AuthedSocket, error: any) => {
    let message = error.message;
    let info;
    if (type === "onMessage") {
      if (error instanceof ZodError) {
        message = "Invalid payload";
        info = JSON.stringify(error.issues);
      }
    }

    if (type === "onceMessage") {
      message = "Authentication failed";
    }
    this.sendMessageToSocket(OutgoingMessageTypes.ERROR, { message, info }, socket);
  };

  private sendMessageToId = (type: OutgoingMessageTypes | GameManagerEvents, payload: Record<string, any>, userId: UserID) => {
    const socket = this.getWebsocket(userId);
    const message = JSON.stringify({ type, payload });
    socket!.send(message);
  };

  private sendMessageToSocket = (type: OutgoingMessageTypes | GameManagerEvents, payload: Record<string, any>, socket: AuthedSocket) => {
    const message = JSON.stringify({ type, payload });
    socket!.send(message);
  };

  private broadcastMessage = (type: OutgoingMessageTypes | GameManagerEvents, payload: Record<string, any>, userIds: UserID[]) => {
    userIds.forEach((userId) => {
      this.sendMessageToId(type, payload, userId);
    });
  };

  private onGameCreated = (roomCode: RoomCode, hostId: UserID) => {
    const socket = this.getWebsocket(hostId);
    socket!.isHostingGame = roomCode;
    this.sendMessageToId(GameManagerEvents.GAME_CREATED, { roomCode }, hostId);
  };

  private onPlayerJoined = (userId: UserID, roomCode: RoomCode, playersInRoom: UserID[]) => {
    const socket = this.getWebsocket(userId);
    socket!.isPlayingGame = roomCode;
    this.broadcastMessage(GameManagerEvents.PLAYER_JOINED, { userId }, playersInRoom);
  };
  private onPlayerLeft = (userId: UserID, playersInRoom: UserID[]) => {
    const socket = this.getWebsocket(userId);
    socket!.isHostingGame = undefined;
    socket!.isPlayingGame = undefined;
    this.broadcastMessage(GameManagerEvents.PLAYER_LEFT, { userId }, playersInRoom);
  };

  private addEventListeners = () => {
    this.eventEmitter.on(GameManagerEvents.GAME_CREATED, this.onGameCreated);
    this.eventEmitter.on(GameManagerEvents.PLAYER_JOINED, this.onPlayerJoined);
    this.eventEmitter.on(GameManagerEvents.PLAYER_LEFT, this.onPlayerLeft);
  };
}
