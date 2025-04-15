import express from "express";
import { addLinks, deleteLinks, fetchUser, handleUploadImage, updateUser } from "../controllers/user.controller";
import verifyToken from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const userRoute = express.Router();

const uploadMulter = upload.single('profilePic') as unknown as express.RequestHandler

userRoute.post("/upload-image",verifyToken,uploadMulter,handleUploadImage)
userRoute.get("/me",verifyToken,fetchUser)
userRoute.put("/update-user",verifyToken,uploadMulter,updateUser)
userRoute.post("/add-links",verifyToken,addLinks)
userRoute.post("/delete-links",verifyToken,deleteLinks)

export default userRoute;