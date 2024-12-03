import { Router } from 'express';
import { getvideoComments, addComment, deleteComment,updateComment } from '../controller/commentController.js';
import { verifyJwt } from '../middleware/authenticationMiddleware.js';

const router = Router();

router.use(verifyJwt); 

router.route("/:videoId").get(getvideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router