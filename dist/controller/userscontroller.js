"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleUser = exports.getAllUsers = exports.resendOTP = exports.Login = exports.verifyUser = exports.Register = void 0;
const utils_1 = require("../utils");
const userModel_1 = require("../model/userModel");
const uuid_1 = require("uuid");
const config_1 = require("../config");
/** ================================ Registration ================================ **/
const Register = async (req, res) => {
    try {
        const { email, phone, password, confirm_password } = req.body;
        const uuidUser = (0, uuid_1.v4)();
        const validateResult = utils_1.registerSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        //Generate salt
        const salt = await (0, utils_1.GenerateSalt)();
        const userPassword = await (0, utils_1.GeneratePassword)(password, salt);
        //Generate OTP
        const { otp, expiry } = (0, utils_1.GenerateOTP)();
        //Send Mail to user
        const html = (0, utils_1.emailHTML)(otp);
        await (0, utils_1.sendmail)(config_1.fromAdminMail, email, config_1.userSubject, html);
        //check if user exists - The email exists with us
        const User = await userModel_1.UserInstance.findOne({ where: { email: email } });
        //create user
        if (!User) {
            let user = await userModel_1.UserInstance.create({
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
            await (0, utils_1.onRequestOTP)(otp, phone);
            //Send mail to user
            const html = (0, utils_1.emailHTML)(otp);
            await (0, utils_1.sendmail)(config_1.fromAdminMail, email, config_1.userSubject, html);
            //Check if user exists
            const User = (await userModel_1.UserInstance.findOne({
                where: { email: email },
            }));
            //Generate GenerateSignature
            let signature = await (0, utils_1.GenerateSignature)({
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
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/users/signup",
        });
    }
};
exports.Register = Register;
/** ================================ Verify User ================================ **/
//create user verification
const verifyUser = async (req, res) => {
    try {
        const token = req.params.signature;
        const decode = await (0, utils_1.verifySignature)(token);
        const User = (await userModel_1.UserInstance.findOne({
            where: { email: decode.email },
        }));
        if (User) {
            const { otp } = req.body;
            if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
                const updatedUser = (await userModel_1.UserInstance.update({
                    verified: true,
                }, { where: { email: decode.email } }));
                //Generate GenerateSignature
                let signature = await (0, utils_1.GenerateSignature)({
                    id: updatedUser.id,
                    email: updatedUser.email,
                    verified: updatedUser.verified,
                });
                if (updatedUser) {
                    const User = (await userModel_1.UserInstance.findOne({ where: { email: decode.email } }));
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
    }
    catch (err) {
        console.log(err.message),
            res.status(500).json({
                Error: "Internal server Error",
                route: "/users/verify",
            });
    }
};
exports.verifyUser = verifyUser;
/** ================================ Login User ================================ **/
const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validateResult = utils_1.loginSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        const User = (await userModel_1.UserInstance.findOne({
            where: { email: email },
        }));
        if (User) {
            const validation = await (0, utils_1.validatePassword)(password, User.password, User.salt);
            if (validation) {
                let signature = await (0, utils_1.GenerateSignature)({
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
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/users/login",
        });
    }
};
exports.Login = Login;
/** ================================ Resend OTP ================================ **/
const resendOTP = async (req, res) => {
    try {
        const token = req.params.signature;
        const decode = await (0, utils_1.verifySignature)(token);
        const User = (await userModel_1.UserInstance.findOne({
            where: { email: decode.email },
        }));
    }
    catch (error) {
        res.status(500).json({
            Error: "internal server error",
            route: "/users/resend-otp/:signature",
        });
    }
};
exports.resendOTP = resendOTP;
/** ================================ Profile ================================ **/
const getAllUsers = async (req, res) => {
    try {
        const limit = req.query.limit;
        const users = await userModel_1.UserInstance.findAndCountAll({
            limit: limit,
        });
        return res.status(200).json({
            message: "You have successfully retrieved all users",
            Count: users.count,
            Users: users.rows,
        });
    }
    catch (err) {
        res.status(500).json({
            Error: "internal server error",
            route: "/users/get-all-users",
        });
    }
};
exports.getAllUsers = getAllUsers;
const getSingleUser = async (req, res) => {
    try {
    }
    catch (err) {
        res.status(500).json({
            Error: "internal server error",
            route: "/users/get-user",
        });
    }
};
exports.getSingleUser = getSingleUser;
