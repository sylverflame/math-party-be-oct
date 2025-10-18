import EventEmitter from "events";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import { appRouter } from "./routes.ts";
import { WebSocketManager } from "./WebSocketManager";
import fs from "fs";
import https, { ServerOptions } from "https";
import { config } from "dotenv";

config();

const app = express();
const PORT = process.env.PORT || 443;

const options: ServerOptions = {
  key: fs.readFileSync(process.env.SSL_KEY!),
  cert: fs.readFileSync(process.env.SSL_CERT!),
};

const server = https.createServer(options, app);
const wss = new WebSocketServer({ server });
const eventEmitter = new EventEmitter();
export const gameManager = new GameManager(eventEmitter);
export const socketManager = new WebSocketManager(wss, eventEmitter);

app.use("/api/v1", appRouter);

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
