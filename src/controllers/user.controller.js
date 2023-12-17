import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user data from req.body
  const { userName, email, password, fullName } = req.body;
  console.log("user details received", req.body);
  // validate data sent by the client
  if ([fullName, userName, email, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  // check if user exists in database: userName, email
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User name and email already exists");
  }
  // check for images and avatar
  console.log("avatar path", req.files);
  // console.log("coverImage path", req.files?.coverImage[0]?.path);
  const avatarLocalPath = req.files?.avatar[0]?.path;

  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files?.coverImage) && req.files?.coverImage?.length > 0) {
    coverImageLocalPath = req.files?.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload images, avatar to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
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
  return res.status(201).json(new ApiResponse(200, "User created successfully", createdUser));
});

export { registerUser };
