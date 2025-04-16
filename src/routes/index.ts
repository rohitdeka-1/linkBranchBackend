import { Router } from "express";
import linksRouter from "./links.route";
import authRoute from "./auth.route";
import userRoute from "./user.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/links", linksRouter);

export default router;
