import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Users } from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const response = await Users.findAll({
      attributes: ["id", "name", "email", "createdAt", "updatedAt"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const Register = async (req, res) => {
  const { name, email, password, confirm_password } = req.body;
  const checkEmail = await Users.findOne({
    where: {
      email: email,
    },
  });

  if (checkEmail)
    return res.status(400).json({ message: "Email sudah terdaftar!" });

  if (password !== confirm_password)
    return res.status(400).json({ message: "Password tidak sama!" });
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    await Users.create({
      name,
      email,
      password: hashPassword,
    });
    res.status(201).json({ message: "Berhasil register!" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const Login = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await Users.findAll({
      where: {
        email: req.body.email,
      },
    });
    const match = await bcrypt.compare(password, user[0].password);
    if (!match) return res.status(400).json({ message: "Password salah!" });

    const userId = user[0].id;
    const name = user[0].name;
    const email = user[0].email;

    const accessToken = jwt.sign(
      { userId, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    const refreshToken = jwt.sign(
      { userId, name, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          id: userId,
        },
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(404).json({ message: "Email tidak ditemukan" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await Users.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await Users.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};
