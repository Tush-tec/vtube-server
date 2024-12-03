import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscriptionModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid request: Channel ID is not valid!");
    }

    const isSubscriber = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id,
    });

    if (!(isSubscriber || isSubscriber.isActive)) {

        const createSubscribe = await Subscription.findOneAndUpdate(
            {
                channel: channelId,
                subscriber: req.user?._id,
            },
            {
                channel: channelId,
                subscriber: req.user?._id,
                isActive: true,
            },
            {
                upsert: true,
                new: true 
            } 
        );

        if (!createSubscribe) {
            throw new ApiError(500, "Internal Server Error: Unable to subscribe.");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                createSubscribe,
                "Successfully subscribed to the channel."
            )
        );
    }

    const removeSubscription = await Subscription.findOneAndUpdate(
        {
            channel: channelId,
            subscriber: req.user?._id,
        },
        { isActive: false },
        { new: true }
    );

    if (!removeSubscription) {
        throw new ApiError(500, "Internal Server Error: Unable to unsubscribe.");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            removeSubscription,
            "Successfully unsubscribed from the channel."
        )
    );
});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

   
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const subscriberList=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user?._Id)
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscriberList",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"subscriber",
                            foreignField:"_id",
                            as:"subscriber",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        email:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            subscriber:{
                                $first:"subscriber"
                            }
                        }
                    },
                    {
                        $lookup:{
                            from:"users",
                            localField:"channel",
                            foreignField:"_id",
                            as:"channel",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        email:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            channel:{
                                $first:"channel"
                            }
                        }
                    },
                ]
            }
        },
        {
            $project:{
                subscriberList:1
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscriberList[0].subscriberList
        )
    )


    
});


const getSubscribedChannel = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const ChannelList=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"ChannelList",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"subscriber",
                            foreignField:"_id",
                            as:"subscriber",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        email:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            subscriber:{
                                $first:"subscriber"
                            }
                        }
                    },
                    {
                        $lookup:{
                            from:"users",
                            localField:"channel",
                            foreignField:"_id",
                            as:"channel",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        email:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            channel:{
                                $first:"channel"
                            }
                        }
                    },
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,ChannelList[0].ChannelList,
            "Subscribed Channel list returned successfully"
        )
    )
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannel };
