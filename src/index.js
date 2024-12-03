
import connectDB from './db/connection.js'
import { app } from "./app.js";


connectDB()
.then(()=>{
        app.listen(process.env.PORT,()=>{
        console.log(`server is running on: ${process.env.PORT}`);  
    })
})
.catch((err)=>{
   console.log("MongoDB connection is failed !!!", err);
   
})