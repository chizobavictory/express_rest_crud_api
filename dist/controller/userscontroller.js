"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register = void 0;
const Register = (req, res) => {
    try {
        return res.status(200).json({
            message: "Success",
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.Register = Register;
