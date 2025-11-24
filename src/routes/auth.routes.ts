import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";
import { UserService } from "../services/UserService";

const authRouter = (userService: UserService) => {
  const router = Router();
  const controller = authController(userService);
  router.post("/login", authMiddleware.validateToken, controller.loginUser);
  router.post("/admin-login", controller.loginAdmin);
  return router;
};

export default authRouter;
