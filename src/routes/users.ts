import express from "express";
import { Register, verifyUser } from "../controller/userscontroller";

const router = express.Router();
router.post('/signup', Register);
router.post('/verify/:signature', verifyUser);

export default router;
