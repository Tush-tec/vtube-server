import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/commentModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getvideoComments = asyncHandler(async (req, res) => {
    try {
      const { videoId } = req.params;
      const { page = 1, limit = 10 } = req.query;
  
      if (!isValidObjectId(videoId)) {
        throw ApiError(400, "Invalid video Id");
      }
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitInt = parseInt(limit);
  
     
      const fetchComment = await Comment.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        { $skip: skip },
        { $limit: limitInt },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            text: 1,
            createdAt: 1,
            "userDetails.name": 1,
            "userDetails.avatar": 1,
          },
        },
      ]);
  
      // Aggregate count of comments
      const totalComments = await Comment.countDocuments({ video: videoId });
  
      if (fetchComment.length === 0) {
        throw new ApiError(404, "No comments found for this video");
      }
  
      return res
      .status(200)
      .json(
        new ApiResponse(200, { comments: fetchComment, totalComments }, "Comments fetched successfully")
      );
    } catch (error) {
      throw new ApiError(
        500,
        error.message || "Internal server problem, cannot get video comments"
      );
    }
  });
  

const writeComment = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text } = req.body;

    if (!isValidObjectId(videoId)) {
      throw ApiError(400, "invalid video id");
    }

    if (!text || text.trim() === "") {
      throw ApiError(400, "Comment Text Can't be empty!");
    }

    const user = req.user._id;

    if (!user) {
      throw ApiError(404, "User not Found");
    }

    const addComment = await Comment.create({
      Video: videoId,
      user,
      text,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, addComment, "Comment added SuccessFully"));
  } catch (error) {
    throw ApiError(
      500,
      error.message || "Internal Server Error, Cannot add Comment"
    );
  }
});

const updateComment = asyncHandler(async (req, res) => {
    
    try {
      const { videoId, commentId } = req.params;
      const { text } = req.body;
  
      if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
      }
      if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
      }
  
      if (!text || text.trim() === "") {
        throw new ApiError(400, "Comment text cannot be empty");
      }
  
      const user = req.user?._id;
  
      // Find and check comment ownership
      const comment = await Comment.findById(commentId);
  
      if (!comment) {
        throw new ApiError(404, "Comment not found");
      }
  
      if (comment.owner.toString() !== user.toString()) {
        throw new ApiError(403, "You can only update your own comments");
      }
  
      // Update Comment
      comment.content = text;  // 'content' field from the schema
      comment.updatedAt = Date.now();
      await comment.save();  // Save the updated comment
  
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment updated successfully"));
    } catch (error) {
      throw new ApiError(
        500,
        error.message || "Internal server error, cannot update comment"
      );
    }
  });

  const deleteComment = asyncHandler(async (req, res) => {
    try {
      const { commentId } = req.params;
  
      if (!isValidObjectId(commentId)) {
        throw ApiError(400, "Invalid CommentId");
      }
  
      const user = req.user?._id;
  
      // Find and check comment ownership
      const comment = await Comment.findById(commentId);
  
      if (!comment) {
        throw new ApiError(404, "Comment not found");
      }
  
      if (comment.owner.toString() !== user.toString()) {
        throw new ApiError(403, "You can only delete your own comments");
      }
  
      // Delete Comment
      await Comment.findByIdAndDelete(commentId);
  
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
    } catch (error) {
      throw new ApiError(
        500,
        error.message || "Internal server error, cannot delete comment"
      );
    }
  });
export {
   getvideoComments, 
   writeComment, 
   updateComment,
    deleteComment };
