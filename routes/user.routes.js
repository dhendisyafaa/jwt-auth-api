import express from "express";
import {
  Login,
  Logout,
  Register,
  getAllUsers,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { refreshToken } from "../controllers/refreshToken_controller.js";

const router = express.Router();

router.get("/users", verifyToken, getAllUsers);
// router.get("/user:id", verifyToken, getAllUsers);
router.post("/user", Register);
router.post("/login", Login);
router.get("/token", refreshToken);
router.delete("/logout", Logout);

export default router;
