import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  option,
  GeneratePassword,
  GenerateSalt,
  GenerateOTP,
  onRequestOTP,
  sendmail,
  emailHTML,
  GenerateSignature,
  verifySignature,
  validatePassword,
} from "../utils";
import { UserAttributes, UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { fromAdminMail, userSubject } from "../config";

/** ================================ Registration ================================ **/
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
        message: "User created succesfully, check your email or phone for OTP verification",
        signature,
        verified: User.verified,
      });
    }
    return res.status(400).json({
      message: "User already exists",
    });
  } catch (err: any) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/users/signup",
    });
  }
};

/** ================================ Verify User ================================ **/
//create user verification
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = await verifySignature(token);

    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAttributes;

    if (User) {
      const { otp } = req.body;
      if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
        const updatedUser = (await UserInstance.update(
          {
            verified: true,
          },
          { where: { email: decode.email } }
        )) as unknown as UserAttributes;

        //Generate GenerateSignature
        let signature = await GenerateSignature({
          id: updatedUser.id,
          email: updatedUser.email,
          verified: updatedUser.verified,
        });

        if (updatedUser) {
          const User = (await UserInstance.findOne({ where: { email: decode.email } })) as unknown as UserAttributes;

          return res.status(200).json({
            message: "User verified successfully",
            signature,
            verified: User.verified,
          });
        }
      }
    }
    return res.status(400).json({
      Error: "Invalid credentials or OTP expired",
    });
  } catch (err: any) {
    console.log(err.message),
      res.status(500).json({
        Error: "Internal server Error",
        route: "/users/verify",
      });
  }
};

/** ================================ Login User ================================ **/
export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const validateResult = loginSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttributes;
    if (User) {
      const validation = await validatePassword(password, User.password, User.salt);
      if (validation) {
        let signature = await GenerateSignature({
          id: User.id,
          email: User.email,
          verified: User.verified,
        });
        return res.status(200).json({
          message: "You have successfully logged in",
          signature,
          email: User.email,
          verified: User.verified,
        });
      }
    }
    return res.status(400).json({
      Error: "Wrong username and password",
    });
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/users/login",
    });
  }
};

/** ================================ Resend OTP ================================ **/
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = await verifySignature(token);

    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAttributes;
  } catch (error) {
    res.status(500).json({
      Error: "internal server error",
      route: "/users/resend-otp/:signature",
    });
  }
};

/** ================================ Profile ================================ **/
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit as number | undefined;
    const users = await UserInstance.findAndCountAll({
      limit: limit,
    });
    return res.status(200).json({
      message: "You have successfully retrieved all users",
      Count: users.count,
      Users: users.rows,
    });
  } catch (err) {
    res.status(500).json({
      Error: "internal server error",
      route: "/users/get-all-users",
    });
  }
};


export const getSingleUser = async(req: Request, res: Response)=>{
  try {
    
  } catch (err) {
    res.status(500).json({
      Error: "internal server error",
      route: "/users/get-user",
    }) 
  }
}