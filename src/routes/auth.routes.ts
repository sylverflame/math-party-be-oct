import { Router } from "express";
import { loginAdmin, loginUser } from "../controllers/auth.controller";
import { validateToken } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/login", validateToken, loginUser);
authRouter.post("/admin-login", loginAdmin);
export default authRouter;
