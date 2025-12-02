import { Router } from "express";
import { UserService } from "../services/UserService";
import userController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";

const userRouter = (userService: UserService) => {
  const router = Router();
  const controller = userController(userService);
  router.patch("/", authMiddleware.validateToken, controller.patchUser);
  return router;
};

export default userRouter;
