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
  
}

