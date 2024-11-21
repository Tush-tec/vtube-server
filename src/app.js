import express, { urlencoded } from "express";
import cors from 'cors'
import cookieParser from 'cookie-parser';



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Settings for Configauration to get Data in various Form
app.use(express.json({limit:"50kb"})) // For Get Json Data through From;
app.use(express.urlencoded({extended:true, limit:"16kb"}))// Get Data From URL. this feature automatically read URL
app.use(express.static("public")) // Sometimes we want to store File or Documents and images in our server so we this for that.static("folderName for get things")
app.use(cookieParser());// From my server i Access User Cookies and set them  >> //When a client sends a request to the server, any cookies stored on the client’s side are automatically attached to the request headers. cookie-parser reads these cookies from the request and parses them, making it easy for you to access their values in req.cookies.

// Routes import
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/videoRoutes.js'



// Routes Declration:

app.use('/api/v1/users', userRouter)
app.use('/api/v1/video', videoRouter)




export{ app }