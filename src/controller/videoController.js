import mongoose, { isValidObjectId, Schema } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.service.js";

// Fetch all videos
const getAllVideo = asyncHandler(async (req, res, next) => {
  
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
  const user = req.user?._id;

  // Check if user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Convert `page` and `limit` to numbers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Build Query Object
  const queryObject = { owner: new mongoose.Types.ObjectId(user) };
  console.log(queryObject);
  
  if (query) {
    const queryRegex = new RegExp(query, "i");
    queryObject.$or = [{ title: queryRegex }, { description: queryRegex }];
  }

  // Sorting Options
  const sortOptions = {};
  if (sortBy && sortType) {
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // Default sort by creation date
  }

  try {
    // Aggregate Videos with Pagination
    const videos = await Video.aggregate([
      { $match: queryObject },
      { $sort: sortOptions }, // Enable sorting
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      { $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true } }, // Optionally unwind
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
    ]);

    // Total Video Count
    const count = await Video.countDocuments(queryObject);
  console.log(count);
  
    // Send Response
    return res
    .status(200)
    .json(
      new ApiResponse(200, {
        videos,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalPage: Math.ceil(count / limitNumber),
          totalVideo: count,
        },
      }, "Videos fetched successfully")
    );
  } catch (error) {
    console.error("Error Stack:", error.stack); // Log the full stack trace
    next(new ApiError(500, error.message || "Failed to fetch videos"));
  }
});


// Get Video by ID
const getVideoById = asyncHandler(async (req, res) => {
  
  try {
    const { videoId } = req.params;

    // Validate video ID
    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    // Fetch the video and populate user details (name and email)
    const video = await Video.findById(videoId)
      .populate("user", "name email")  // Populating the 'user' field with only 'name' and 'email' fields

    // If video not found, throw error
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    // Return the response with video and populated user details
    return res.status(200).json({
      status: 200,
      data: video,  // Return the video object with populated user details
      message: "Video fetched successfully"
    });
  } catch (error) {
    console.error(error); // For debugging
    throw new ApiError(
      500,
      error.message || "Video fetch by ID failed due to internal server error"
    );
  }
});

// Publish Video
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and Description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file path is missing");
  }

  if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail file path is missing");
  }

  try {
    // Upload video to Cloudinary
    const videoUploadResponse = await uploadOnCloudinary(videoLocalPath, "video");
    if (!videoUploadResponse || !videoUploadResponse.secure_url) {
      throw new ApiError(500, "Video upload to Cloudinary failed.");
    }

    // Upload thumbnail to Cloudinary
    const thumbnailUploadResponse = await uploadOnCloudinary(thumbnailPath, "image");
    if (!thumbnailUploadResponse || !thumbnailUploadResponse.secure_url) {
      throw new ApiError(500, "Thumbnail upload to Cloudinary failed.");
    }

    // Save video details in the database
    const videoCreation = await Video.create({

      videoFile: videoUploadResponse.secure_url,
      thumbnail: thumbnailUploadResponse.secure_url,
      owner: req.user?._id,
      title,
      description,
      duration: videoUploadResponse.duration,

    });

    return res.status(201).json(
      new ApiResponse(200, videoCreation, "Your video is published successfully!")
    );
  } catch (error) {
    console.error(error);
    throw new ApiError(500, error.message || "Your video could not be published due to an internal error.");
  }
});

// Update Video
const updateVideo = asyncHandler(async (req, res) => {
 
  try {
    
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(401, "Unauthorized request!");
    }

    // Update video details
    video.title = title;
    video.description = description ;

    if (thumbnail) {
      await cloudinary.uploader.destroy(video.publicId);
      const thumbnailUploadResponse = await cloudinary.uploader.upload(thumbnail, {
        resource_type: 'image',
      });
      video.thumbnail = thumbnailUploadResponse.secure_url;
      video.publicId = thumbnailUploadResponse.public_id;
    }

    await video.save();

    return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video details updated successfully")
    );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message || "Video details could not be updated due to internal server error");
  }
});

// Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(401, "Unauthorized request!");
    }

    await cloudinary.uploader.destroy(video. req.user?._id);
    await video.remove();

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message || "Video could not be deleted due to server error");
  }
});

// Toggle Video Publish Status

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID format");
    }

    console.log("Received videoId:", videoId);


    const cleanedVideoId = videoId.trim();

    const video = await Video.findById(cleanedVideoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(401, "Unauthorized request!");
    }

    video.published = !video.published;
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message || "Could not toggle video publish status");
  }
});


export {
  getAllVideo,
  getVideoById,
  publishVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
