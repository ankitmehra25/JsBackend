import { asyncHandler, asyncHandler2 } from "../utils/asyncHandler.js";

const registerUser = asyncHandler2(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Register",
  });
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Login",
  });
});

export { registerUser, loginUser };
