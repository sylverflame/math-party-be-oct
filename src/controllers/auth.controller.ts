import { NextFunction, Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../error-handling/Errors";
import { Status } from "../types";
import jwt from "jsonwebtoken";

const googleLogin = (req: Request, res: Response) => {
  if (!req.user) {
    throw new BadRequestError("Authentication failed");
  }
  // return user details
  const { token } = req.user as any;
  res.redirect(`${process.env.FE_SERVER}/login?token=${token}`);
};

const loginUser = (req: Request, res: Response, next: NextFunction) => {
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

const loginAdmin = (req: Request, res: Response, next: NextFunction) => {
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

const authController = {
  googleLogin,
  loginUser,
  loginAdmin,
};

export default authController;
