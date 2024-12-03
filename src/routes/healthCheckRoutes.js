import { Router } from "express"
import { healthCheck } from "../controller/healthCheckController.js";
import { verifyJwt } from "../middleware/authenticationMiddleware.js";


const router = Router()

router.use(verifyJwt)

router.route("/").get(healthCheck)


export default router
