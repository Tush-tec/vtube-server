import mongoose, {Schema} from "mongoose"

const playlistSchema =  new Schema(
    {
      name:{
        type: String,
        required : true
      }, 
      description:{
        type: String,

      },
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video",
        required : true

    },
    owner: {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true

    }
    },
    {
        timestamps:true
    }
    
)

const Playlist = mongoose.model("playlist", playlistSchema)

export {Playlist}