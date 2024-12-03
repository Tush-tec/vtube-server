import { Router } from 'express';
import {
    getSubscribedChannel,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controller/subscriptionController.js"

import {verifyJwt} from "../middleware/authenticationMiddleware.js"

const router = Router();
router.use(verifyJwt); 

router
    .route("/c/:channelId")
    .get(getSubscribedChannel)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router