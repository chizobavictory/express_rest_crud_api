"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.Register = void 0;
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
            }
        }
    }
    catch (err) {
        res.status(500).json({
            Error: "Internal server Error",
            route: "/users/verify"
        });
    }
};
exports.verifyUser = verifyUser;
