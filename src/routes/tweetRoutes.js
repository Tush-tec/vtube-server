import { Router } from "express";
import {createTweet, getTweet, updateTweet, deleteTweet} from "../controller/tweetController.js"
import { verifyJwt } from "../middleware/authenticationMiddleware.js";

const router  = Router()

router.use(verifyJwt)

router.use("/create-tweet").post(createTweet)
router.use("/tweet").get(getTweet)
router.use("/update-tweet").patch(updateTweet)
router.use("/deleteTweet").delete(deleteTweet)
