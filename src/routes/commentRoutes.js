import { Router } from 'express';
import { getvideoComments, addComment, deleteComment,updateComment } from '../controller/commentController';

const router = Router();

router.use(verifyJWT); 

router.route("/:videoId").get(getvideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router