import express, { Request, Response } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/users";
import indexRouter from "./routes/index";
import { db } from "./config/database";

//sequelize connection
db.sync()
  .then(() => {
    console.log("Db connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());

//Router Middleware
app.use("/", indexRouter);
app.use('/users', userRouter);

const port = 3500;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

export default app;
