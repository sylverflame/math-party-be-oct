import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../error-handling/Errors";
import { Status } from "../types";

export const loginUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isValidUser, email, accessToken } = req.user as any;
    let userId = email.split("@")[0];
    let country = "IND";
    const user = { email, userId, country };
    res.status(Status.Success).json({ isValidUser, user, accessToken });
  } catch (error) {
    next(error);
  }
};
