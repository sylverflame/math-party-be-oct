import { Router } from "express";
import { PassportStatic } from "passport";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { UserService } from "../services/UserService";

const googleRouter = (passport: PassportStatic, userService: UserService) => {
  const router = Router();
  const controller = authController(userService);
  router.get("/", authMiddleware.onGoogleLoginRequest(passport));
  router.get("/callback", authMiddleware.onGoogleLoginCallback(passport), controller.googleLogin);
  return router;
};

export default googleRouter;
