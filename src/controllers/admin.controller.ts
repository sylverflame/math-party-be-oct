import { NextFunction, Request, Response } from "express";
import { gameManager, socketManager } from "..";
import { Status } from "../types";

const sendMessageToSocket = (req: Request, res: Response, next: NextFunction) => {
  const { socketId } = req.query;
  const { message } = req.query;
  try {
    const socket = socketManager.getWebsocket(socketId as string);
    socket?.send("Hello from get request");
    res.status(Status.Success).json({ Message: `Message sent to ${socketId}` });
  } catch (error) {
    next(error);
  }
};

const getAllSockets = (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalClients = socketManager.totalClients();
    const authenticatedList = socketManager.listWebSockets();
    res.status(Status.Success).json({
      totalClients,
      authenticated: authenticatedList.length,
      authenticatedList,
    });
  } catch (error) {
    next(error);
  }
};

const broadcastMessageToSockets = (req: Request, res: Response, next: NextFunction) => {
  const { authOnly } = req.query;
  try {
    socketManager.broadcastMessageToAllClients(authOnly === "true");
    res.status(Status.Success).json({ Message: "Success!" });
  } catch (error) {
    next(error);
  }
};

const getAllGames = (req: Request, res: Response, next: NextFunction) => {
  try {
    const games = gameManager.getRoomCodes();
    res.status(Status.Success).json(games);
  } catch (error) {
    next(error);
  }
};

const getGameUsingRoomCode = (req: Request, res: Response, next: NextFunction) => {
  const { roomCode } = req.params;
  try {
    const game = gameManager.getGame(roomCode);
    res.status(Status.Success).json(game);
  } catch (error) {
    next(error);
  }
};

const adminController = {
  sendMessageToSocket,
  getAllSockets,
  broadcastMessageToSockets,
  getAllGames,
  getGameUsingRoomCode
};

export default adminController;
