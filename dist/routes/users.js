"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userscontroller_1 = require("../controller/userscontroller");
const router = express_1.default.Router();
router.get('/signup', userscontroller_1.Register);
exports.default = router;