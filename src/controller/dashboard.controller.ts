
import type {  Response } from "express";
import { getContributionStats, getDashboardStats, getMonthlyActivity } from "../service/dashboard.service.js";
import type { AuthRequest } from "../types/auth.types.js";

export const getDashboardController = async (
  req:AuthRequest,
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
    const dashboardData = await getDashboardStats(userId);

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};
export const getContributionStat = async (
  req:AuthRequest,
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
    const getContributionStat = await getContributionStats(userId);

    return res.status(200).json({
      success: true,
      data: getContributionStat,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};
export const getMonthlyActivityController = async (
  req:AuthRequest,
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
    const data = await getMonthlyActivity(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Monthly Activity Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly activity",
    });
  }
}