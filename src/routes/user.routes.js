import {Router}  from 'express'
import {loggedOutUser, loginUser,registerUser, refereshAccessToken, changeCurrentUSerPassword, getCurrentUser,  updateAccountDetails, updateUserAvatar, updateCoverImage, getUserChannelProfile, getUserWatchHistory} from '../controller/userController.js'
import upload from '../middleware/multer.middleware.js'
import { verifyJwt }  from '../middleware/authenticationMiddleware.js'

const router = Router()


router.route("/register").post(
    // Upload Images on this Route
    upload.fields([
       {
        name:"avatar",
        maxCount:1
       },
       {
        name : "coverImage",
        maxCount:1
       }
    ]),
    // Redirection to Route
    registerUser
)
router.route('/login').post(loginUser)

// Secure Routes
router.route('/logout').post(verifyJwt, loggedOutUser)
router.route("/refresh-token").post(refereshAccessToken)
router.route('/change-password').patch(verifyJwt,changeCurrentUSerPassword)
router.route('/current-user').get(verifyJwt,getCurrentUser)
router.route('/update-account').patch(verifyJwt,updateAccountDetails)
router.route('/avatar').patch(verifyJwt,upload.single("avatar"), updateUserAvatar)
router.route('/coverimage').patch(verifyJwt,upload.single("coverImage"), updateCoverImage)
router.route('/c/:userName').get(verifyJwt, getUserChannelProfile)
router.route('/history').get(verifyJwt,getUserWatchHistory)



export default router;