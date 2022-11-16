"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register = void 0;
const utils_1 = require("../utils");
const userModel_1 = require("../model/userModel");
const uuid_1 = require("uuid");
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
        //check if user exists
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
            return res.status(201).json({
                message: "User created succesfuly",
                user,
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
