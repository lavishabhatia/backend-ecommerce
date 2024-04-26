import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadonOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontends    //  return res

  const { fullName, email, username, password } = req.body;
  console.log("email :", email);

  // if (fullName === "") {
  //   throw new ApiError(400 , "fullname is required");
  // }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new AppError(400, "All fiels are required");
  }
  const exitedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (exitedUser) {
    throw new AppError(409, "User with email or username already exists");
  }
  const avartarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (avartarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadonOnCloudinary(avartarLocalPath);
  const coverImage = await uploadonOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Sucessfully"));
});

export { registerUser };
