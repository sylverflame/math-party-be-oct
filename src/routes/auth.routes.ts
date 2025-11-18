import { Router } from "express";
import { loginUser } from "../controllers/auth.controller";
import { validateToken } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/login", validateToken, loginUser);
export default authRouter;
