import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const healthCheck = asyncHandler(async(req,res) =>{
   const memoryUsage = process.memoryUsage()
   const uptime = process.uptime()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
             appName : Vtube, 
             version : 1,
             memoryUsage : {
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
             },
             uptime: `${Math.floor(uptime)} seconds`,
             dependencies: {
                 database: "Connected", 
            }},
            "Server and Dependancies are operational well"
            

        )
    )
})


export {
    healthCheck
}