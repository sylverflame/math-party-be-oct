import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PassportStatic } from "passport";
import { BadRequestError } from "../error-handling/Errors";
import { ErrorCodes } from "../types";

const onGoogleLoginRequest = (passport: PassportStatic) => {
  return passport.authenticate("google", { scope: ["profile", "email"] });
};

const onGoogleLoginCallback = (passport: PassportStatic) => {
  return passport.authenticate("google", { session: false, failureRedirect: "/" });
};

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.url === "/login") {
      token = req.body.token;
    } else {
      token = req.headers.authorization?.split(" ")[1];
    }
    let isValidUser = false;
    if (!token) {
      throw new BadRequestError(ErrorCodes.ERR_001);
    }
    const { email, id } = jwt.verify(token, process.env.JWT_SECRET!) as any;
    isValidUser = true;
    req.user = { isValidUser, id, email, accessToken: token };
    next();
  } catch (error) {
    next(error);
  }
};

const validateAdminToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new BadRequestError(ErrorCodes.ERR_001);
    }
    jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as any;
    next();
  } catch (error) {
    next(error);
  }
};

const authMiddleware = {
  onGoogleLoginRequest,
  onGoogleLoginCallback,
  validateToken,
  validateAdminToken,
};

export default authMiddleware;
