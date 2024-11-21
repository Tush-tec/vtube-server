import { User } from "../models/userModel.js"
import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"


const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
      // Check for token in cookies or Authorization header
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

      console.log("Cookies:", req.cookies);
      console.log("Token:", token);
      
      if (!token) {
          throw new ApiError(401, "Unauthorized Request");
      }
      
      // Verify token synchronously
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (!decodedToken) {
          throw new ApiError(400, "Token verification failed");
      }

      console.log("Decoded Token:", decodedToken);

      // Find the user by the decoded token ID
      const user = await User.findById(decodedToken._id).select("-password -refreshToken");

      if (!user) {
          throw new ApiError(401, "Invalid Access Token");
      }

      // Attach the user to the request object
      req.user = user;
      next();
  } catch (error) {
      next(new ApiError(401, error?.message || "Invalid Access Token"));
  }
});

export { verifyJwt };
