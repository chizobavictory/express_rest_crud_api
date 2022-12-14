"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userscontroller_1 = require("../controller/userscontroller");
const authorization_1 = require("../middleware/authorization");
const router = express_1.default.Router();
router.post("/signup", userscontroller_1.Register);
router.post("/verify/:signature", userscontroller_1.verifyUser);
router.post("/login", userscontroller_1.Login);
router.get("/resend-otp/:signature", userscontroller_1.resendOTP);
router.get("/get-all-users", userscontroller_1.getAllUsers);
router.get("/get-user", authorization_1.auth, userscontroller_1.getSingleUser);
router.get("/update-profile", authorization_1.auth, userscontroller_1.getSingleUser);
router.patch();
exports.default = router;
