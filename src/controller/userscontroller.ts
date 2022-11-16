import { Request, Response } from "express";
import { registerSchema, option, GeneratePassword, GenerateSalt, GenerateOTP } from "../utils";
import { UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";

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

    //Generate OTP
    const { otp, expiry } = GenerateOTP();

    //check if user exists
    const User = await UserInstance.findOne({ where: { email: email } });

    //create user
    const uuidUser = uuidv4();
    if (!User) {
      let user = await UserInstance.create({
        id: uuidUser,
        email,
        password: userPassword,
        firstName: "",
        lastName: "",
        salt,
        address: "",
        phone,
        otp,
        otp_expiry: expiry,
        lng: 0,
        lat: 0,
        verified: false,
      });

      res.status(201).json({
        message: "User created succesfuly",
        user,
      });
    }
    res.status(400).json({
      message: "User already exists",
    });

    
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/users/signup",
    });
  }
};
