import {Router}  from 'express'
import {getAllVideo, publishVideo, updateVideo, deleteVideo, togglePublishStatus, getVideoById} from '../controller/videoController.js'
import upload from '../middleware/multer.middleware.js'
import {verifyJwt} from '../middleware/authenticationMiddleware.js'

const router = Router()

router.use(verifyJwt)

router.route("/video").get(getAllVideo)
router.route('/upload-video').post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishVideo // This is the actual request handler
  );
  
  

router.route('/:videoId').get(getVideoById)
router.route("/:id").delete(deleteVideo)
router.route("/:id").patch(upload.single("thumbnail"), updateVideo)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router