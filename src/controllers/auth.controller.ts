import { NextFunction, Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../error-handling/Errors";
import { Status } from "../types";
import jwt from "jsonwebtoken";

export const loginUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isValidUser, email, id, accessToken } = req.user as any;
    let userId = email.split("@")[0]; // Client using username as userId
    let country = "IND";
    const user = { id, userId, country };
    res.status(Status.Success).json({ isValidUser, user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ username }, process.env.ADMIN_JWT_SECRET!, { expiresIn: "5m" });
      res.status(Status.Success).json({ token });
      return;
    }
    throw new UnauthorizedError("Invalid credentials!");
  } catch (error) {
    next(error);
  }
};
