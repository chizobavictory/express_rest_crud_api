import { Sequelize } from "sequelize";

export const db = new Sequelize("app", "", "", {
  storage: "./food.sqlite",
  dialect: "sqlite",
  logging: false,
});
