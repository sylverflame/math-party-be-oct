import cors from "cors";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import EventEmitter from "events";
import express, { json } from "express";
import http from "http";
import { PassportStatic } from "passport";
import { WebSocketServer } from "ws";
import { googleOAuthConfig } from "./config/auth";
import { GameManager } from "./GameManager";
import { validateAdminToken } from "./middlewares/auth.middleware";
import { globalErrorHandler, invalidRouteHandler } from "./middlewares/errorHandler.middleware";
import { adminRouter } from "./routes";
import authRouter from "./routes/auth.routes";
import { WebSocketManager } from "./WebSocketManager";

config();

const app = express();
const PORT = process.env.PORT || 443;
export const db = drizzle(process.env.DATABASE_URL!);

let passport: PassportStatic;

try {
  passport = googleOAuthConfig();
} catch (err: any) {
  console.error("Startup error:", err.message);
  process.exit(1); // Exit app if critical env vars are missing
}

// Middlewares
app.use(passport.initialize());
app.use(json());
app.use(
  cors({
    origin: process.env.FE_SERVER!,
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
app.get("/api/v1/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/api/v1/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/" }), (req, res) => {
  if (!req.user) {
    res.status(400).json({ error: "Authentication failed" });
  }
  // return user details
  const { token } = req.user as any;
  res.redirect(`${process.env.FE_SERVER}/login?token=${token}`);
});

app.use("/api/v1/admin", validateAdminToken, adminRouter);
app.use("/api/v1/auth", authRouter);

// For invalid routes and methods
app.use(invalidRouteHandler);

// Error Handler
app.use(globalErrorHandler);

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
