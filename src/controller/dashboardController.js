import mongoose, { isValidObjectId } from "mongoose";
import {User} from "../models/userModel.js"
import {Video} from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from '../utils/ApiResponse.js'
import {asyncHandler} from "../utils/asyncHandler.js"


const getChannelStatics = asyncHandler(async (req, res) => {


    const stats = await User.aggregate([
        {
            $match: {
                _id:  mongoose.Types.ObjectId(req.user?._id), // Match the logged-in user's channel
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
                subscriberInfo: { 
                    $size: "$subscribers" 
                }
            }
        },
        {
            $lookup: {
                from: "videos", 
                localField: "_id", 
                foreignField: "owner", 
                as: "videoInfo",
                pipeline: [
                    {
                        $group: {
                            _id: null,
                            totalViews: { $sum: "$views" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalViews: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoInfo: {
                    $arrayElemAt: ["$videoInfo", 0] 
                }
            }
        }
    ]);

    if (!stats || stats.length === 0) {
        throw new ApiError(404, "Stats not found for the user");
    }

    return res.status(200).json(
        new ApiResponse(200, stats[0], "This is your stats")
    );
});


const getChannelVideo = asyncHandler(async(req,res) =>{
    
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError (400, "channel is invalid!")
    }

    const video = await Video.find(
        {
            owner: channelId 
        }

    ).select("title description views likes createdAt") 
     .sort({ createdAt: -1 }); 

     
    if (!video || video.length === 0) {
        throw new ApiError(404,"No video Founde for this Channel!")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Channel video is here!"
        )
    );
});


export{
    getChannelStatics,
    getChannelVideo
}