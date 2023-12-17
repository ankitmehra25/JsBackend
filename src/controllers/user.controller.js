import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user data from req.body
  const { userName, email, password, fullName } = req.body;
  console.log(req.body);
  // validate data sent by the client
  if ([fullName, username, email, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  // check if user exists in database: username, email
  const existingUser = User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User name and email already exists");
  }
  // check for images and avatar
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  // upload images, avatar to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar || !coverImage) {
    throw new ApiError(400, "Avatar and cover Image are required");
  }
  // create user object and save it to db
  const user = await User.create({
    userName,
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  // check created user and remove sensitive data
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  // send response to client
  if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user");
  return res.status(201).json(ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Login",
  });
});

export { registerUser, loginUser };
