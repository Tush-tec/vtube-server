import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.service.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Seprate Method of Genrate Access or Refresh Token
const genrateAccessorRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error while generating tokens:", error);
    throw new ApiError(500, "Something went wrong while making tokens");
  }
};

console.log("generateAccessorRefreshToken", genrateAccessorRefreshTokens);

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend

  //  Access all Data through Req; if user data comes from body write req.body and if user data comes from url write req.url  4
  const { userName, email, fullName, password } = req.body;
  console.log(req.body);

  // console.log("user:",userName, "Email:", email, "fullname:", fullName);

  // validation - Not Empty
  if (
    [userName, fullName, email, password].some(
      (valueofField) => valueofField?.trim() === ""
    )
  ) {
    throw new ApiError(
      400,
      "All field Are Neccesaary, Please fill it According to Given Field"
    );
  }

  // > check if user already exist

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with Email is already Exists!");
  }

  // > check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path; // Check CONSOLE.LOG WHAT IS COMING
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Files is Required");
  }

  // > upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar Filed Is Required");
  }
  // if(!coverImage){
  //     throw new ApiError(400, "Avatar Files is required")
  // }
  // create user object - create entry in db

  const usercreation = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });

  // Check UserCreation and Remove Password and Refresh Token field From Response
  const checkUserCreatedorNot = await User.findById(usercreation._id).select(
    "-password -refreshToken"
  );

  //  Condition if User is not Create
  if (!checkUserCreatedorNot) {
    throw ApiError(500, "Something Went Wrong While Registrations of user.");
  }

  // check this response and check for user creation, user create or not

  return res
    .status(201)
    .json(
      new ApiResponse(200, checkUserCreatedorNot, "User Register Successful")
    );

  //  if user is create then send response
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if (!(userName || email || password)) {
    throw new ApiError(404, "userName or Email is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User Does not Exist");
  }
  // Check password
  const ValidationofPassword = await user.isPasswordCorrect(password);
  if (!ValidationofPassword) {
    throw new ApiError(401, "Invalid user password");
  }
  // Access or Refresh token Genration/making
  const { accessToken, refreshToken } = await genrateAccessorRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refereshToken"
  );

  // Send Cookies
  const options = {
    httpOnly: true,
    secure: true, // this mean that cookies is only modified from server not from frontend or browser.
  };

  // Send Respone
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
        "User logged in Successfully"
      )
    );
});

//  Logout User

const loggedOutUser = asyncHandler(async (req, res) => {
  console.log(req.user._id);

  try {
    await User.findByIdAndUpdate(
      req.user._id,

      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User Logged-Out"));
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while logging out",
      error: error.message,
    });
  }
});

// EndPoint for refresh Access Token
const refereshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError("401", "unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, " invalid Refresh-Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used.");
    }

    const { accessToken, newrefreshToken } = await genrateAccessorRefreshTokens(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "AccessToken Refresh Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh Token");
  }
});

const changeCurrentUSerPassword = asyncHandler(async (req, res) => {
  //
  const { oldPassWord, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassWord);

  if (!isPasswordCorrect) {
    throw new ApiError(
      400,
      "Invalid User Password, Check Your Password and tryAgain!"
    );
  }

  user.password = newPassword;

  if (newPassword !== confirmPassword) {
    throw ApiError(401, "Password Not Match, Please Check and TryAgain!");
  }

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { newPassword }, "Password Change SuccessFully!")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(201, req.user, "User Fetched succesfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName } = req.body;

  if (!fullName) {
    throw new ApiError(400, "Please provide the fullName");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullName } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Full name updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(404, "We Cannot Fetch Your Avatar Request");
  }

  const user = await User.findById(req.user?._id);
  const currentAvatarUrl = user?.path;

  if (currentAvatarUrl) {
    await cloudinary.uploader.destroy(publicId);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw ApiError(400, "Error While Uploading avatar On Cloudinary");
  }

  const updateUser = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        avatar: avatar?.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, updateUser, "CoverImage update Successfully.")
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw ApiError(404, "We Cannot Fetch Your Avatar Request");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw ApiError(400, "Error While Uploading avatar On Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage update Successfully."));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  if (!userName.trim()) {
    throw new ApiError(400, "Cannot get User");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscribers",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(400, "Aggregate did not return results");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully")
    );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user.id),
      },
    },
    {
      $lookup: {
        from: "Video",
        localField: "watchHistory",
        foreignField: "_id",
        as: "UserWatchHistory",
        pipeline: [
          {
            $lookup: {
              from: "user",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.WatchHistory,
        "History data fetched. Here are your past activities."
      )
    );
});

export {
  registerUser,
  loginUser,
  loggedOutUser,
  refereshAccessToken,
  changeCurrentUSerPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};
