import { WebSocket } from "ws";
import { socketManager } from ".";
import { SendMessageType, UserID } from "./types";

export const sendMessage = (type: SendMessageType, payload: Record<string, any>, socket: WebSocket) => {
  const message = JSON.stringify({ type, payload });
  socket.send(message);
};

export const broadcastMessageToRoom = (type: SendMessageType, payload: Record<string, any>, playersInRoom: UserID[]) => {
  playersInRoom.forEach((player) => {
    const socket = socketManager.getWebsocket(player);
    if(!socket){
        throw new Error("Socket does not exist")
    }
    sendMessage(type, payload, socket)
  });
};
