import express from "express";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import {
  AuthMessage,
  AuthMessageSchema,
  MessageSchema,
  WsMessage,
} from "./Schemas";
import { ZodError } from "zod";
import { WebSocketManager } from "./WebSocketManager";

const app = express();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const socketManager = new WebSocketManager(wss);

app.get("/socket/:socketId", (req, res) => {
  const { socketId } = req.params;
  const { message } = req.query;
  try {
    const socket = socketManager.getWebsocket(socketId);
    socket!.send(`Message from get request - ${message ?? "Hello"}`);
    res.json({ Message: `Message sent to ${socketId}` });
  } catch (error) {
    res.json({ Error: "Socket does not exist" });
  }
});

app.get("/socket", (req, res) => {
  try {
    const connectedSocketList = socketManager.listWebSockets();
    res.json({ clients: connectedSocketList.length, connectedSocketList });
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});

app.get("/broadcast", (req, res) => {
  try {
    const connectedSocketList = socketManager.listWebSockets();
    res.json({ clients: connectedSocketList.length, connectedSocketList });
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});


const handleError = (
  type: "onMessage" | "onceMessage",
  socket: WebSocket,
  error: any
) => {
  switch (type) {
    case "onMessage":
      if (error instanceof ZodError) {
        socket.send("Invalid payload!");
        return;
      }
      socket.send("JSON payload expected");
      break;
    case "onceMessage":
      socket.send("Authentication Failed!");
      break;
    default:
      socket.send("Internal server Error!");
      break;
  }
};

interface AuthedSocket extends WebSocket {
  id: string;
  userId?: string;
  isAuthenticated: boolean;
}

const attachMessageHandler = (socket: AuthedSocket) => {
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

wss.on("connection", (socket: AuthedSocket) => {
  socket.id = crypto.randomUUID();
  socket.isAuthenticated = false;
  socket.send(
    JSON.stringify({ type: "Message", Message: "Authenticate Yourself" })
  );
  socket.once("message", (data: AuthMessage) => {
    try {
      const parsed = JSON.parse(data.toString());
      const validatedMessage = AuthMessageSchema.parse(parsed);
      const { userId, token } = validatedMessage.payload;
      // TODO: Validate token here

      // --
      // Once validated
      socket.isAuthenticated = true;
      socket.userId = userId;
      socketManager.addWebsocket(userId, socket);
      socket.send(
        `Authentication Successful - Welcome to the server ${userId}`
      );

      // Attach the on message event listener once user is validated
      attachMessageHandler(socket)
    } catch (error) {
      handleError("onceMessage", socket, error);
      socket.close();
    }
  });

  socket.on("error", (error) => {
    console.error(error);
  });

  socket.on("close", () => {
    const userId = socket.userId;
    if (!userId) {
      return;
    }
    socketManager.removeSocket(userId);
  });
});

wss.on("error", (error) => {
  console.error(error);
});

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
