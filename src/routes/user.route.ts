import express from "express";
import { addLinks, deleteLinks, getCurrentUser, handleUploadImage, incrementVisitCount, updateUser } from "../controllers/user.controller";
import verifyToken from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const userRoute = express.Router();

const uploadMulter = upload.single('profilePic') as unknown as express.RequestHandler

userRoute.post("/upload-image",verifyToken,uploadMulter,handleUploadImage)
userRoute.get("/me",verifyToken,getCurrentUser)
userRoute.put("/user-up",verifyToken,uploadMulter,updateUser)
// TODO: Move this api route to links.route.ts file also it's controller
// TODO: Use payload-validator
userRoute.post("/links",verifyToken,addLinks)
userRoute.delete("/:linkId",verifyToken,deleteLinks)            // TODO: Move this api route to links.route.ts file also it's controller
userRoute.patch("/:username/visit", incrementVisitCount);


export default userRoute;   

