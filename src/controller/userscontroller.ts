import { Request, Response } from "express";
import { registerSchema, option, GeneratePassword, GenerateSalt } from "../utils/utils";

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, confirm_password } = req.body;
    const validateResult = registerSchema.validate(req.body, option);

    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }
    //Generate salt
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/users/signup",
    });
  }
};
