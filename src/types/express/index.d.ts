// import express from "express";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: Record<string,any>;
//       user?: Document;
//     }
//   }
// }

import { Request } from "express";
import { IUser } from "../../models/user.model";
export interface IRequest extends Request{
  user?: IUser;
  user?:Document;
  user?: {
    _id: string;
    fullname?: string;
    username?: string;
    email?: string;
    profilePic?: string;
  };
  file?: {
    path: string;
    filename?: string;
    mimetype?: string;
    size?: number;
  };
}

