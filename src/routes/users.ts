import express from "express";
import { Register } from "../controller/userscontroller";

const router = express.Router();
router.get("/signup", Register);

export default router;
