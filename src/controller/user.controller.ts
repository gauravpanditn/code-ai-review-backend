import type {  Response } from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../service/user.service.js";
import type { AuthRequest } from "../types/auth.types.js";

export const getUserProfileController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
    const user = await getUserProfile(userId);
    
    
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch profile",
    });
  }
};

export const updateUserProfileController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, email } = req.body;

    const user = await updateUserProfile(
      userId,
      {
        name,
        email,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update profile",
    });
  }
};
