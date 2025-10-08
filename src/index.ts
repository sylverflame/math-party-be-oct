import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { WebSocketManager } from "./WebSocketManager";
import { GameManager } from "./GameManager";
import EventEmitter from "events";

const app = express();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const eventEmitter = new EventEmitter();
const gameManager = new GameManager(eventEmitter);
export const socketManager = new WebSocketManager(wss, gameManager, eventEmitter);

app.get("/socket/:socketId", (req, res) => {
  const { socketId } = req.params;
  const { message } = req.query;
  try {
    const socket = socketManager.getWebsocket(socketId);
    socket?.send("Hello from get request");
    res.json({ Message: `Message sent to ${socketId}` });
  } catch (error) {
    res.json({ Error: "Socket does not exist" });
  }
});

app.get("/socket", (req, res) => {
  try {
    const totalClients = socketManager.totalClients();
    const authenticatedList = socketManager.listWebSockets();
    res.json({
      totalClients,
      authenticated: authenticatedList.length,
      authenticatedList,
    });
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});

app.get("/broadcast", (req, res) => {
  const { authOnly } = req.query;
  try {
    socketManager.broadcastMessageToAllClients(authOnly === "true");
    res.json({ Message: "Success!" });
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});

app.get("/game", (req, res) => {
  try {
    const games = gameManager.getRoomCodes();
    res.json(games);
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});

app.get("/game/:roomCode", (req, res) => {
  const { roomCode } = req.params;
  try {
    const game = gameManager.getGame(roomCode);
    res.json(game);
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
