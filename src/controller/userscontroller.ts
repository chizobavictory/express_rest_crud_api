import { Request, Response } from "express";
import {
  registerSchema,
  option,
  GeneratePassword,
  GenerateSalt,
  GenerateOTP,
  onRequestOTP,
  sendmail,
  emailHTML,
  GenerateSignature,
} from "../utils";
import { UserAttributes, UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { fromAdminMail, userSubject } from "../config";

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, confirm_password } = req.body;
    const uuidUser = uuidv4();
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

    //Send Mail to user
    const html = emailHTML(otp);
    await sendmail(fromAdminMail, email, userSubject, html);

    //check if user exists - The email exists with us
    const User = await UserInstance.findOne({ where: { email: email } });

    //create user
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

      // Send OTP to user
      await onRequestOTP(otp, phone);

      //Send mail to user
      const html = emailHTML(otp);
      await sendmail(fromAdminMail, email, userSubject, html);

      //Check if user exists
      const User = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAttributes;

      //Generate GenerateSignature
      let signature = await GenerateSignature({
        id: User.id,
        email: User.email,
        verified: User.verified,
      });

      return res.status(201).json({
        message: "User created succesfully",
        signature,
      });
    }
    return res.status(400).json({
      message: "User already exists",
    });
  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({
      Error: "Internal server Error",
      route: "/users/signup",
    });
  }
};
