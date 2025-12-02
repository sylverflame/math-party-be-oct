import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { Status } from "../types";

const userController = (userService: UserService) => ({
  patchUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const data = await userService.updateUser(userId, req.body);
      
      res.status(Status.Success).json({
        message: "User updated successfully",
        user: {...data, userId: data.username},
      });
    } catch (error) {
      next(error);
    }
  },
});

export default userController;
