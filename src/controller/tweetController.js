import mongoose, { isValidObjectId, mongo } from "mongoose";
import {Tweet} from "../models/tweetModel.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const createTweet = asyncHandler(async (req, res) => {
 try {
   const { content } = req.body;
 
   if (!content) {
     throw new ApiError(400, "unauthorised Request");
   }
 
   const createTweet = await Tweet.create({
     content,
     owner : req.user?._id
   })
 
   if(!createTweet) {
     throw new ApiError(400, "Something went wrong, cannot create tweet")
   }
 
   return res
   .status(200)
   .json(
     new ApiResponse(
       200,
       createTweet,
       "Tweet Create Succesfully"
     )    
   )
 } catch (error) {
   throw new ApiError(500, "User not create due to internal error")
 }
});

const getTweet = asyncHandler(async (req, res) => {

 try {
   const {userId} = req.param
   
    if(!isValidObjectId(userId)){
     throw new ApiError(400, "invalid Request user doesn't exist")
    }
 
    const getTweet = await Tweet.findById({owner : userId})
   
    if (getTweet.length === 0) {
     throw new ApiError(404, "No tweets found");
   }
 
   return res
   .status(200)
   .json(
     new ApiResponse(
       200,
       getTweet,
       `your tweet was this ${getTweet}`
     )
   )
 } catch (error) {
    throw ApiError(500, "Cannot processed Your Request!")
 }
});

const updateTweet = asyncHandler(async (req, res) => {

  try {
    const {content} = req.body
     
    if(!content){
       throw new ApiError(400, "cannot processed your request beacuse user not exisst!")
    }
    
    const {tweetId} =req.param
    const tweet = await Tweet.findById(tweetId);
  
    if(!tweet){
      throw new ApiError(400, "inavlid tweeetId")
    }
    
 
    
  
    if(tweet.owner !==  req.user?._id) {
       throw ApiError(400, "You're not allowed to change someone else comment")
    }
  
    const updateTweet = await Tweet.findByIdAndUpdate( tweetId,
      {
        $set :{
          content,
        }
      },
      {
        new : true
      }
    )
  
    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateTweet,
        "tweet update Successfully"
      )
    )
  
  } catch (error) {
      throw new ApiError(500, "internal server error cannot manipulate tweet")
  }
});

const deleteTweet = asyncHandler(async (req, res) => {

  try {
    const {tweetId} = req.param
   
    if(!mongoose.isValidObjectId(tweetId)) {
      throw new ApiError(400, " cannot processed your request")
    }
   
    const {tweet} = await findById(tweetId)
  
    if(!tweet.owner !==  req.user?._id ){
      throw new ApiError(403, "You're not allowed for delete this content")
    }
  
    const remove = await Tweet.findByIdAndDelete(tweetId)
  
    if(!remove) {
      throw new ApiError(400,"something went wrong while deleting Tweet")
    }
  
    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        remove,
        `you request is completed user tweet is deleted ${tweetId}` 
      )
    )  
  } catch (error) {
    throw new ApiError(500, error.message ||"internal server error while deleting a tweet")
  }

  
});

export { 
  createTweet,
  getTweet, 
  updateTweet, 
  deleteTweet 
};
