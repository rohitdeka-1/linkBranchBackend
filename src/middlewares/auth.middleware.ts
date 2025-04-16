
import { Request, Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model";
import { IRequest } from "../types/express";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

const verifyToken = async(req:IRequest,res:Response,next:NextFunction):Promise<any> => {

    const token = req.header('Authorization')?.split(' ')[1]; 
    if(!token) return res.status(401).json({"success":false,"message" : "Access Denied"});
    try{
        const decoded:{userId:string} = jwt.verify(token,`${ACCESS_TOKEN_SECRET}` ) as {userId:string};
        const user = await User.findOne({_id:decoded.userId});

        
        if (!user) {
            return res.status(401).json({ "success": false, "message": "User not found" });
          }

        req.user = user;


        next();
    }
    catch(err){
        res.status(401).json(
            {
                "success" : false,
                "message" : "Invalid or expired token"
            }
        )
    }
}

export default verifyToken;