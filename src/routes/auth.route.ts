import express from "express";
import { userRegistration,userLogin, userLogout } from "../controllers/auth.controller";
import { inputValidationError, loginInputValidator, registerationInputValidator } from "../middlewares/authValidator";


const authRoute = express.Router();

authRoute.post("/register",registerationInputValidator,inputValidationError,userRegistration);
authRoute.post("/login",loginInputValidator,inputValidationError,userLogin);
authRoute.post("/logout", userLogout);

export default authRoute;




