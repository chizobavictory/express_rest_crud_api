import { Request, Response } from "express";
import { registerSchema, option } from "../utils/utils";


export const Register = (req: Request, res: Response) => {
  try {
    const { email, phone, password, confirm_password } = req.body;
    const validateResult = registerSchema.validate(req.body,option);

    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
