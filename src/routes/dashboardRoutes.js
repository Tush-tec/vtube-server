import { Router } from "express";
import {
  getChannelStatics,
  getChannelVideo,
} from "../controller/dashboardController.js";
import { verifyJwt } from "../middleware/authenticationMiddleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/channel-stats").get(getChannelStatics);
router.route("/channel-videos").get(getChannelVideo);

export default router
