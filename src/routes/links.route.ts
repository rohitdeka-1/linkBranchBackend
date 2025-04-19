import express from "express";
import verifyToken from "../middlewares/auth.middleware";
import { fetchLinksByUser, updateLink } from "../controllers/links.controller";

const linksRouter = express.Router();

linksRouter.get("/", verifyToken, fetchLinksByUser);
linksRouter.get("/:username",fetchLinksByUser)
linksRouter.put("/:linkId",verifyToken,updateLink)

export default linksRouter;