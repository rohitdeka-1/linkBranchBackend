import  dotenv  from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import statusMonitor from "express-status-monitor";
import process  from "process";
dotenv.config();


const app = express();
app.use(express.json({
    limit:"15KB"
}))

app.use(express.urlencoded({
    extended:true,
    limit:"15KB"
}))

app.use(cors({
    origin:["*"],
    methods:["GET","POST","PUT","PATCH"]
}))

app.use(require('express-status-monitor')());

app.use(require('express-status-monitor')());
app.use(cookieParser());

import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";

app.use("/api/v1/auth",authRoute)

app.get("/",(req,res)=>{
    res.send(`Running on ${process.pid}`)
})

app.use("/api/v1/user",userRoute)


export {app};

