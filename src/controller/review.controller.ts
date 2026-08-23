import type { Request, Response } from "express";
import { getReviews } from "../service/review.service.js";


export const getReviewsController = async (
  req: Request,
  res: Response
) => {
  try {
    const reviews = await getReviews(req);

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);

    return res.status(401).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};
