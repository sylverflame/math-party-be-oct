import { Router } from "express";
import { PassportStatic } from "passport";
import authMiddleware from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";

const googleRouter = (passport: PassportStatic) => {
  const router = Router();
  router.get("/", authMiddleware.onGoogleLoginRequest(passport));
  router.get("/callback", authMiddleware.onGoogleLoginCallback(passport), authController.googleLogin);
  return router;
};

export default googleRouter;
