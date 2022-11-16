import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config()


export const db = new Sequelize("app", "", "", {
  storage: "./food.sqlite",
  dialect: "sqlite",
  logging: false,
});


export const accountSid = process.env.AccountSID
export const authToken = process.env.AuthToken
export const fromAdminPhone = process.env.fromAdminPhone