import cors from "cors";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import EventEmitter from "events";
import express, { json } from "express";
import http from "http";
import { PassportStatic } from "passport";
import { WebSocketServer } from "ws";
import { configurePassport } from "./config/auth";
import { GameManager } from "./GameManager";
import authMiddleware from "./middlewares/auth.middleware";
import { globalErrorHandler, invalidRouteHandler } from "./middlewares/errorHandler.middleware";
import { adminRouter } from "./routes";
import authRouter from "./routes/auth.routes";
import googleRouter from "./routes/google.routes";
import { WebSocketManager } from "./WebSocketManager";

config();

const PORT = process.env.PORT || 443;
const DATABASE_URL = process.env.DATABASE_URL!;
const FE_SERVER = process.env.FE_SERVER!;

export const db = drizzle(DATABASE_URL);
export let passportInstance: PassportStatic;

try {
  passportInstance = configurePassport();
} catch (err: any) {
  console.error("Startup error -", err.message);
  process.exit(1); // Exit app if critical env vars are missing
}

const app = express();

// Middlewares
app.use(passportInstance.initialize());
app.use(json());
app.use(
  cors({
    origin: FE_SERVER,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Create WebSocket server
// const options: ServerOptions = {
//   key: fs.readFileSync(process.env.SSL_KEY!),
//   cert: fs.readFileSync(process.env.SSL_CERT!),
// };
// const server = https.createServer(options, app);
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const eventEmitter = new EventEmitter();
export const gameManager = new GameManager(eventEmitter);
export const socketManager = new WebSocketManager(wss, eventEmitter);

// Routes
app.use("/api/v1/google", googleRouter(passportInstance));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", authMiddleware.validateAdminToken, adminRouter);

// Error handlers
app.use(invalidRouteHandler);
app.use(globalErrorHandler);

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
