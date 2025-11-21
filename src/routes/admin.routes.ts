import { Router } from "express";
import adminController from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.get("/socket/:socketId", adminController.sendMessageToSocket);
adminRouter.get("/socket", adminController.getAllSockets);
adminRouter.get("/broadcast", adminController.broadcastMessageToSockets);
adminRouter.get("/game", adminController.getAllGames);
adminRouter.get("/game/:roomCode", adminController.getGameUsingRoomCode);

export default adminRouter;