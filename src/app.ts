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
    origin:["http://localhost:5173"],
    methods:["GET","POST","PUT","PATCH"],
    credentials: true,
}))

app.use(require('express-status-monitor')());

app.use(cookieParser());

import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
import router from "./routes";

// Routes
app.use("/api/v1", router);
app.get("/",(req,res)=>{
    res.send(`Running on ${process.pid}`)
})



export {app};

