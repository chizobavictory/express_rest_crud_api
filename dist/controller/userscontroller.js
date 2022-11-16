"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register = void 0;
const utils_1 = require("../utils/utils");
const Register = async (req, res) => {
    try {
        const { email, phone, password, confirm_password } = req.body;
        const validateResult = utils_1.registerSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res.status(400).json({
                Error: validateResult.error.details[0].message,
            });
        }
        //Generate salt
        const salt = await (0, utils_1.GenerateSalt)();
        const userPassword = await (0, utils_1.GeneratePassword)(password, salt);
        console.log(userPassword);
    }
    catch (err) {
        console.log(err);
    }
};
exports.Register = Register;
