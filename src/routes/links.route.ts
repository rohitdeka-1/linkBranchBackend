import express from "express";
import verifyToken from "../middlewares/auth.middleware";
import { fetchLinksByUser } from "../controllers/links.controller";

const linksRouter = express.Router();

linksRouter.get("/", verifyToken, fetchLinksByUser);
linksRouter.get("/public/:username",fetchLinksByUser)

export default linksRouter;