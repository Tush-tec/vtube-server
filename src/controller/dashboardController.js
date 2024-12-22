import mongoose, { isValidObjectId } from "mongoose";
import {User} from "../models/userModel.js"
import {Video} from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from '../utils/ApiResponse.js'
import {asyncHandler} from "../utils/asyncHandler.js"



const getChannelStatics = asyncHandler(async (req, res) => {

        const userId = new mongoose.Types.ObjectId(req.user?._id);
    
        const stats = await User.aggregate([
            {
                $match: {
                    _id: userId,
                }
            },
            {
                $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                }
            },
            {
                $addFields: {
                    subscriberInfo: { $size: "$subscribers" },
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videoInfo",
                    pipeline: [
                        { $group: { _id: null, totalViews: { $sum: "$views" } } },
                        { $project: { _id: 0, totalViews: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    videoInfo: { $arrayElemAt: ["$videoInfo", 0] },
                }
            }
        ]);
    
        if (!stats || stats.length === 0) {
            throw new ApiError(404, "Stats not found for the user");
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse
            (200, stats[0], 
                "This is your stats"
            )
        );
    })   

    const getChannelVideo = asyncHandler(async (req, res) => {
        const Id  =      req.user?._id        ; 
    
        console.log(Id);
        
        if (!Id) {
            throw new ApiError(400, "Invalid user ID!");
        }
    
        const videos = await Video.find({ owner:Id })
            .select("title description views likes createdAt")
            .sort({ createdAt: -1 });
    
        // if (!videos || videos.length === 0) {
        //     throw new ApiError(2, "No videos found for this channel!");
        // }
    
        const totalVideos = videos.length;
        const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
    
        return res.status(200).json(
            new ApiResponse(200, { videos, totalVideos, totalViews }, "Channel videos and stats retrieved successfully!")
        );
    });
    
    

export{
    getChannelStatics,
    getChannelVideo
}