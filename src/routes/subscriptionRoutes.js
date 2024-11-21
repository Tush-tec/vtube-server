import { Router } from 'express';
import {
    getSubscribedChannel,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controller/subscriptionController.js"

import {verifyJWT} from "../middleware/authenticationMiddleware.js"

const router = Router();
router.use(verifyJWT); 

router
    .route("/c/:channelId")
    .get(getSubscribedChannel)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router