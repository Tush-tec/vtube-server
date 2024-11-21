
import connectDB from './db/connection.js'
import { app } from "./app.js";
// import EventEmitter from 'events';

// Custom EventEmitter for handling Errors
// const errorEmitter = new EventEmitter();

// errorEmitter.on('appError', (error) => {
//   console.error(`[${new Date().toISOString()}] - Error: ${error.message}`);
//   console.error(`Stack: ${error.stack}`);

//   // If the error is critical, initiate a graceful shutdown
//   if (isCriticalError(error)) {
//     console.error('Critical error occurred. Shutting down the server gracefully.');
//     shutdownServer();
//   }
// });

// // Function to determine if the error is critical
// function isCriticalError(error) {

//   return error.isOperational !== true;
// }

// function shutdownServer() {

//   app.close(() => {
//     console.log('Closed remaining connections.');
//     process.exit(1); 
//   });

//   setTimeout(() => {
//     console.error('Forcing shutdown due to unclosed connections.');
//     process.exit(1);
//   }, 10000); 
// }

 // Start the server
connectDB()
.then(()=>{
        app.listen(process.env.PORT,()=>{
        console.log(`server is running on: ${process.env.PORT}`);  
    })
})
.catch((err)=>{
   console.log("MongoDB connection is failed !!!", err);
   
})