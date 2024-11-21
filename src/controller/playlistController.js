import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlistModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createPlaylist = asyncHandler(async (req, res) => {
  
  try {
    const { name, description} = req.body;

    if (!name) {
      throw new ApiError(400, "Name is required while making playlist!");
    }


    const owner = req.user?._id;

    if (!owner) {
      throw new ApiError(401, "unauthorised Request");
    }

    const playlistCreation = await Playlist.create({
      name,
      description,
      video: videoExist?._id || null,
      owner,
    });

    if(!playlistCreation){
      throw new ApiError(500, "your Playlist was not created due to internal server error!")
    }

     console.log(playlistCreation);
     
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlistCreation,
          "Playlist Created SuccessFully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Playlist is not Created, having some server error"
    );
  }
});

const getUserPlaylistById = asyncHandler(async (req, res) => {
  

  try {
    const { userId } = req.param;

  
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "User Id is required to Fetch playlist");
    }
  
    const userPlaylist = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
          pipeline : [
            {
              $lookup :{
                from : "users",
                localField:"owner",
                foreignField: "_id",
                as : owner
              }
            },
            {
              $addFields :{ 
                owner : {
                  $first : "owner"
                }
              }
            }
          ],
        },
        
      }
    ]);
    console.log(userPlaylist);
    if (!userPlaylist || userPlaylist.length === 0) {
      throw new ApiError(404, "No playlists found for the specified user");
    }
  
    return res
    .status(200)
    .json(
      new ApiResponse (200, userPlaylist, "userGet by Playlist is Successfull")
    )
  } catch (error) {
     throw new ApiError(500, error.message || "internal server problem, cannot fetched playlist by userId!")
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  //TODO: get playlist by id
  const playlist=await Playlist.aggregate([
      {
          $match:{
              _id:new mongoose.Types.ObjectId(playlistId)
          }
      },
      {
          $lookup:{
              from:"videos",
              localField:"videos",
              foreignField:"_id",
              as:"videos",
              pipeline:[
                  {
                      $lookup:{
                          from:"users",
                          localField:"owner",
                          foreignField:"_id",
                          as:"owner"
                      }
                  },
                  {
                      $addFields:{
                          owner:{
                              $first:"owner"
                          }
                      }
                  }
              ]
          },
      },
      {
          $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner"
          }
      },
      {
          $addFields:{
              owner:{
                  $first:"owner"
              }
          }
      }
  ])
  if(!playlist)
      {
          throw new ApiError(400,"Playlist not found")
      }
  return res.status(200).json(new ApiResponse(200,playlist,"Play list is returned successfully"))
})

const updatePlaylistbyId = asyncHandler(async (req, res) => {

    try {
        const {playlistId} = req.param
        const {name, description} = req.body
        console.log(playlistId);
        
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400, "Cannot Authorized it!")
        }
    
        const updatePlaylist = await  Playlist.findByIdAndUpdate(playlistId,
            {
               $set : {
                name,
                description
               } 
            },
            {new : true}
    
        )
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                updatePlaylist, 
                "your Playlist is Update successfully!"
            )
        )
        
    } catch (error) {
        throw new ApiError(
            500, 
            error.message || "internal server problem cannot update your playlist!"
        )
    }


});

const deletePlaylist = asyncHandler(async (req, res) => {

   try {
     const {playlistId} = req.param
 
     if(!isValidObjectId(playlistId)) {
         throw ApiError(400, "Invalid Request, we  cannot processed this request!")
     }
 
     const updateWithDeleteFunctionality = await Playlist.findByIdAndUpdate( playlistId,
         {
             $unset : {video : 1}
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
             updateWithDeleteFunctionality,
             "Playlist is Delete!"
         )
     )
   } catch (error) {
      throw new ApiError(500, error.message || "Cannot Delete Playlist From database!")
   }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  
        try {
            const { playlistId, videoId } = req.params;
          
            
            if (!isValidObjectId(playlistId)) {
              throw new ApiError(404, "Playlist not found");
            }
    
            const playlist = await Playlist.findById(playlistId);
          
          if(!playlist){
            throw new ApiError(400, "playlist was not found")
          }

          playlist.video.push(new mongoose.Types.ObjectId(videoId))
          
          const updatePlaylist = await playlist.save({validateBeforeSave: false})
            return res
            .status(200)
            .json(
              new ApiResponse(200, updatePlaylist, "Video added to playlist successfully")
            )

        } catch (error) {
            throw new ApiError(
                500,
                 error.message || "cannot add Video to playlist"
            )
        }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    
    try {
        const { playlistId, videoId } = req.params;
      
        const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
          {
             $pull: { 
                video: videoId 
            } 
          }, 
          { new: true },

        )
    
       
        if (!updatedPlaylist) {
          throw new ApiError(404, "Playlist not found");
        }
      
        if (updatedPlaylist.video.length === 0) {
          return res.status(200).json(
            new ApiResponse(200, updatedPlaylist, "Video removed from playlist, and playlist is now empty")
          )
        }
      
        // Return the updated playlist with a success message
        return res.status(200).json(
          new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "cannot remove Video From playlist, due to server error")
    }
});
  

export {
  createPlaylist,
  getUserPlaylistById,
  updatePlaylistbyId,
  getPlaylistById,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
};
