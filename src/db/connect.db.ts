import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async()=>{
    try{
        const con = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("Mongoose Connected"," ",con.connection.host);
    }
    catch(err){
        console.log("Error connecting DB : ", err);
    }
}

export default connectDB;
