import { Router } from "express";
import { gameManager, socketManager } from "..";

export const adminRouter = Router();

adminRouter.get("/socket/:socketId", (req, res) => {
  const { socketId } = req.query;
  const { message } = req.query;
  try {
    const socket = socketManager.getWebsocket(socketId as string);
    socket?.send("Hello from get request");
    res.json({ Message: `Message sent to ${socketId}` });
  } catch (error) {
    res.json({ Error: "Socket does not exist" });
  }
});

adminRouter.get("/socket", (req, res) => {
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

adminRouter.get("/broadcast", (req, res) => {
  const { authOnly } = req.query;
  try {
    socketManager.broadcastMessageToAllClients(authOnly === "true");
    res.json({ Message: "Success!" });
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});

adminRouter.get("/game", (req, res) => {
  try {
    const games = gameManager.getRoomCodes();
    res.json(games);
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});

adminRouter.get("/game/:roomCode", (req, res) => {
  const { roomCode } = req.params;
  try {
    const game = gameManager.getGame(roomCode);
    res.json(game);
  } catch (error) {
    res.json({ Error: "Internal Serer Error" });
  }
});