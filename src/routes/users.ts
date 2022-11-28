import express from "express";
import { Login, Register, resendOTP, verifyUser, getAllUsers, getSingleUser } from "../controller/userscontroller";
import { auth } from "../middleware/authorization";

const router = express.Router();
router.post("/signup", Register);
router.post("/verify/:signature", verifyUser);
router.post("/login", Login);
router.get("/resend-otp/:signature", resendOTP);
router.get("/get-all-users", getAllUsers);
router.get("/get-user",auth, getSingleUser);
router.get("/update-profile",auth, getSingleUser);
router.patch()

export default router;
