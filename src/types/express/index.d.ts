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
export interface IRequest extends Request{
  user?: Iuser;
}

