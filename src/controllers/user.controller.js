import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const generateAccessAndRefereshTokens = async userId => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    // save refresh token to db wihout validation checks on model
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token");
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  // get user data from req.body
  const { userName, email, password } = req.body;
  console.log("user details received in login handler", req.body);
  // check if user exists in database: userName, email
  if (!(userName || email)) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "No account with this username or email");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password, please try again");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // set cookie options for httpOnly and secure
  // httpOnly: true => cookie cannot be accessed by javascript and can only be accessed by server
  // secure: true => cookie can only be sent over https and not over http
  const options = {
    httpOnly: true,
    secure: true,
  };

  // send response to client with cookies set in the response header
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
