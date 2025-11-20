import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login", authMiddleware.validateToken, authController.loginUser);
authRouter.post("/admin-login", authController.loginAdmin);
export default authRouter;
