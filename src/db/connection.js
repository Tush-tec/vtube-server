import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from 'dotenv';
dotenv.config({
  path: "./.env"
});


const connectDB = ( async () => {
    try { 
      const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

      console.log(`\n mongodb Connected !! DB HOST : ${connectionInstance.connection.host} `);
        

    } catch (error) {
        console.error("MonogDb Connection Error",    error);
        process.exit(1)        
    }
    
});

export default connectDB;







