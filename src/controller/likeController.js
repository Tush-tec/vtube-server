import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/likeModel.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";

const VideoLike = asyncHandler(async (req, res) => {
  //  Retrieve video ID from request parameters (req.params)
  //  Find video document by ID using Video.findById()
  //  Check if video exists
  //  Check if user has already liked the video
  //     - If liked, remove like (dislike)
  //     - If not liked, add like
  //  Update video document with new like count
  //  Return success response

  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid objectId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw ApiError(404, "Page not found");
  }

  const user = req.user?._id;

  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }

  const isLiked = await Like.findOne({ video: video, likedBy: user });

  if (isLiked) {
    await Like.deleteOne({ _id: isLiked._id });
  } else {
    await Like.create({ video: video, likedBy: user });
  }

  const likeCount = await Like.countDocuments({ video: video });
  video.likes = likeCount;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video, likeCount },
        `Video is ${isLiked ? "disliked" : "liked"}`
      )
    );
});


const CommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    throw ApiError(400, "Comment Id Is invalid");
  }

  const user = req.user?._id;

  if (!user) {
    throw ApiError(400, "Unauthorized request");
  }

  const isLiked = await Like.findOne({ comment: commentId, likedBy: user });

  if (isLiked) {
    await Like.deleteOne({ _id: isLiked._id });
  } else {
    await Like.create({ comment: commentId, likedBy: user });
  }

  const likeCount = await Like.countDocuments({ comment: commentId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { commentId, likeCount },
        `Comment is ${isLiked ? "disliked" : "liked"}`
      )
    );
});


const TweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    throw ApiError(400, "Invalid Tweet Id");
  }

  const user = req.user?._id;

  if (!user) {
    throw ApiError(401, "Unauthorized user!");
  }

  const isLiked = await Like.findOne({ tweet: tweetId, likedBy: user });

  if (isLiked) {
    await Like.deleteOne({ _id: isLiked._id });
  } else {
    await Like.create({ tweet: tweetId, likedBy: user });
  }

  const likeCount = await Like.countDocuments({ tweetId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweetId, likeCount },
        `tweet is ${isLiked ? "dislike" : "Liked"}`
      )
    );
});

const getAllLikedVideo = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
  
    const likedVideos = await Like.aggregate([
      {
           $match: {
              likedBy: userId 
          } 
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      { $unwind: "$videoDetails" },
      {
        $project: {
          video: "$videoDetails",
        },
      },
    ]);
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
      );
  } catch (error) {
     throw new ApiError(500, error.message || "something Went Wrong!")
  }
});

export {
    
    VideoLike, 
    CommentLike, 
    TweetLike,
    getAllLikedVideo 

};
