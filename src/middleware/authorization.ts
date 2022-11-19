import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "../config";

export const auth = async (req: Request, res: Response) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        Error: "Kindly signin as a user",
      });
    }
    const token = authorization.slice(7, authorization.length);
    let verified = jwt.verify(token, APP_SECRET);

    if (!verified) {
      return res.status(401).json({
        Error: "unauthorized",
      });
    }

    const { id } = verified as { [key: string]: string };
  } catch (error) {
    return res.status(401).json({
      Error: "unauthorized",
    });
  }
};
