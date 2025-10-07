import { WebSocket } from "ws";

export const sendMessage = (type: string, payload: Record<string, any>, socket: WebSocket) => {
  const message = JSON.stringify({ type, payload });
  socket.send(message);
};
