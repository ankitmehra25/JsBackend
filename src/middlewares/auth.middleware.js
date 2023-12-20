import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const accessToken = req?.cookies?.accessToken || req?.header("Authorization")?.replace("Bearer ", "");
    console.log("ACCESS TOKEN", accessToken);
    if (!accessToken) {
      throw new ApiError(401, "Access token missing");
    }
    // verify the access token
    const decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log("DECODED TOKEN", decodedToken);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) {
      // next video: discussion pending
      throw new ApiError(404, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
