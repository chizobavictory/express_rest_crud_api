import express from "express";
import { Register } from "../controller/userscontroller";

const router = express.Router();
router.post('/signup', Register);

export default router;
