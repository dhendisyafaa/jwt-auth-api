import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import db from "./config/db.js";
import { Users } from "./models/user.model.js";
import usersRoute from "./routes/user.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.APP_PORT;

try {
  await db.authenticate();
  console.log("Database connected...");
  await Users.sync();
} catch (error) {
  console.error(error);
}

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use(usersRoute);

app.listen(PORT, () => {
  console.log("Server up and running");
});
