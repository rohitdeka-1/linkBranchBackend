import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const isProd = true;

const userRegistration = async (req: Request, res: Response): Promise<any> => {
  const { fullname, username, email, password } = req.body;
  console.log(username, email);

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existedUser) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  try {
    const createdUser = await User.create({
      fullname,
      username,
      email,
      password,
    });

    if (!createdUser) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: createdUser._id,
        username,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      } as SignOptions
    );

    const refreshToken = jwt.sign(
      {
        userId: createdUser._id,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      } as SignOptions
    );

    createdUser.refreshToken = refreshToken;
    await createdUser.save();

    const registeredUser = {
      userId: createdUser._id,
      name: createdUser.fullname,
      username: createdUser.username,
      email: createdUser.email,
    };

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: isProd ? "none" : "lax",
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: registeredUser,
    });
  } catch (err) {
    console.error("Error in user registration", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { identity, password } = req.body;
  const isProd = process.env.NODE_ENV === "production";

  try {
    const user = await User.findOne({
      $or: [{ email: identity }, { username: identity }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect credentials",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string,
      } as SignOptions
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Access granted",
      accessToken: accessToken,
    });
  } catch (err) {
    console.error("Error while login: ", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully." });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { userRegistration, userLogin, userLogout };
