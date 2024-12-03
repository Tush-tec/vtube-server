import { Router } from "express";
import { verifyJwt } from '../middleware/authenticationMiddleware.js'
import { 
    addVideoToPlaylist,
    getPlaylistById, 
    createPlaylist, 
    deletePlaylist, 
    getUserPlaylistById, 
    removeVideoFromPlaylist, 
    updatePlaylistbyId 
} from "../controller/playlistController.js";



const router = Router()

router.use(verifyJwt)


router.route("/").post(createPlaylist)
router.route('/user-platlist').get(getUserPlaylistById)
router
    .route("/:playlistId")
    .get( getPlaylistById )
    .patch(updatePlaylistbyId)
    .delete(deletePlaylist)

router.route("/add/:videoId/:playlistId").patch  (addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

export default router

