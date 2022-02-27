import { Request, Response } from 'express'
import { User } from "../database/entities/User";

export interface RequestWithAccessToken extends Request {
  accessToken?: string
  user?: User
}

export interface MyContext {
  req: RequestWithAccessToken;
  res: Response;
}
