import { Router } from "express";
import { 
    CommentLike, 
    getAllLikedVideo, 
    TweetLike,
     VideoLike 
} from "../controller/likeController.js";
import { verifyJwt } from "../middleware/authenticationMiddleware.js";

const router = Router()

router.use(verifyJwt)

router.route("/toggle/v/:videoId").post(VideoLike);
router.route("/toggle/c/:commentId").post(CommentLike);
router.route("/toggle/t/:tweetId").post(TweetLike);
router.route("/videos").get(getAllLikedVideo);


