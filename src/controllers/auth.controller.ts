import { NextFunction, Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../error-handling/Errors";
import { Status } from "../types";
import jwt from "jsonwebtoken";
import { UserService } from "../services/UserService";

const authController = (userService: UserService) => ({
  googleLogin: (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Authentication failed");
    }
    // return user details
    const { token } = req.user as any;
    res.redirect(`${process.env.FE_SERVER}/login?token=${token}`);
  },

  loginUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isValidUser, email, picture, name, accessToken } = req.user as any;
      const user = await userService.getUser(email);
      res.status(Status.Success).json({ isValidUser, user: { ...user, picture, name }, accessToken });
    } catch (error) {
      next(error);
    }
  },

  loginAdmin: (req: Request, res: Response, next: NextFunction) => {
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
  },
});

export default authController;
