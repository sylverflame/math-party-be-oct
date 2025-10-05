import { WebSocket, WebSocketServer } from "ws";

export class WebSocketManager {
  private connections: Map<string, WebSocket>;
  private server: WebSocketServer

  /**
   *
   */
  constructor(server: WebSocketServer) {
    this.connections = new Map();
    this.server = server;
    
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
}
