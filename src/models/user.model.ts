import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullname: string,
  username: string;
  email: string;
  password: string;
  profilePic?: string;
  bio?: string;
  theme?: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  refreshToken: string;
}

const userSchema = new Schema<IUser>(
  {
    fullname:{
      type:String,
      required: true,
      trim:true,
      tolowercase:true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      tolowercase:true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {   
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    socialLinks: [
      {
        platform: String,
        url: String,
      }
    ],
    refreshToken:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save",async function(next){
  if (!this.isModified("password")) return next();
  const password = this.password;
  const hashPassword = await bcrypt.hash(password,10);
  this.password = hashPassword;
  next();
})



export const User = mongoose.model<IUser>('User', userSchema);
