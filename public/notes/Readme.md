

- Read upon process in Node. 
   # Process.exit() 
      * If it is necessary to terminate the Node.js process due to an error condition, throwing an uncaught error and allowing the process to terminate accordingly is safer than calling process.exit().

      * In Worker threads, this function stops the current thread rather than the current process.

      * The process.exit() method instructs Node.js to terminate the process synchronously with an exit status of code. If code is omitted, exit uses either the 'success' code 0 or the value of process.exitCode if it has been set. Node.js will not terminate until all the 'exit' event listeners are called.

      * To exit with a 'failure' code:

       import { exit } from 'node:process';

      exit(1);
     The shell that executed Node.js should see the exit code as 1.

      Calling process.exit() will force the process to exit as quickly as possible even if there are still asynchronous operations pending that have not yet completed fully, including I/O operations to process.stdout and process.stderr.

      * in most situations, it is not actually necessary to call process.exit() explicitly. The Node.js process will exit on its own if there is no additional work pending in the event loop. The process.exitCode property can be set to tell the process which exit code to use when the process exits gracefully.
            

     - what is it ? 
             =  DB HOST: cluster-shard-00-00.pkd3d.mongodb.net 


 # Process.env : 
   - The process.env property returns an object containing the user environment. See
   - Assigning a property on process.env will implicitly convert the value to a string. This behavior is deprecated. Future versions of Node.js may throw an error when the value is not a string, number, or boolean.   

 # Cookie-Parser : 
 # CORS : (Cross-Origin-Resource-Sharing)     
   
   * App.use - Use it when we Set Middleware or do Configaurational Settings.

 # AsnycHandler Functioon :

   * "The purpose of this code is to create a reusable wrapper function for handling asynchronous route handlers", so any errors that occur within them can be caught and sent to the client with a standardized error response. This is commonly done to avoid writing repetitive try-catch blocks in each async route handler.

     * However, the code as written won't work because:

   1. await(req,res,next) is not valid. You would need to pass an async function to asyncHandler instead. 

   2. err is undefined; you need to use error to reference the caught error.

   * How It Work :

    1. Wrapper Function (asyncHandler): This function takes an asynchronous function (fn) as an argument and returns a new function.

    2. Returned Function: The returned function (an async function) is designed to accept req, res, and next parameters, like any Express route handler.
   3. try-catch Block:

     > In the try block, it executes the passed-in function (fn(req, res, next)) and awaits its result.
     > If an error occurs, it’s caught by the catch block, and an error response is sent back to the client.
     > Error Response: In case of an error, it sends a JSON response with the error message and a default status code of 500 (if no error code is specified).



# Class : Error in node.js 

   * The class keyword allows you to create custom error types, which is useful for adding additional context to your errors or grouping them by type. 

   * Creating custom error classes is useful in applications to distinguish different error types, especially when handling them in middleware for HTTP APIs or handling specific error actions in other Node.js applications.

# Moongoose : 

  * Aggregate-Paginate :
  * Moongose-MiddleWare :
  * plugin :
  * Method :

# Bcrypt : 
  * Hash 
  * Compare 
  * GenSalt  

# JWT (JSON-Web-Token) : 

   * It is a "Bearer Token" : What is that mean?

      > This mean that whoever Bear (has) this Token they Have access to Data. it like a key for Data Transfer.

   * AccessToken-Secret :
   * AccessToken-Expiry :
   * Refresh-Token :

   * Token Generate : 
     > JWT.sign({"PayLoad"}, Access-token-secret{expireIn:Token expiry})

   * How it works:
     1. User logs in, server creates a JWT and sends it to the client.
     2. Client stores the JWT and sends it with each request (usually in the Authorization header).
     3. Server verifies the token to authenticate the user without storing session data.

   * Refresh Token :

     A refresh token is a long-lived token used to obtain a new JWT (access token) when the current one expires.

     How it works:
     1. When the user logs in, the server issues both an access token (short-lived) and a refresh token (long-lived).
     2. When the access token expires, the client uses the refresh token to request a new access token.
     3. Server verifies the refresh token, then issues a new access token if valid.

     Benefits:
     - Enhances security by limiting the lifespan of access tokens.
     - Reduces the need for users to frequently log in.
  

# File Upload :
# Fs:
  > Help For Read Write  

# Multer :

   * Destination : A string or function that determines the destination path for uploaded files. If a string is passed and the directory does not exist, Multer attempts to create it recursively. If neither a string or a function is passed, the destination defaults to os.tmpdir().

   * FileName :A function that determines the name of the uploaded file. If nothing is passed, Multer will generate a 32 character pseudorandom hex string with no extension.

   * Work of Function as Middleware : Returns a Multer instance that provides several methods for generating middleware that process files uploaded in multipart/form-data format.

   The StorageEngine specified in storage will be used to store files. If storage is not set and dest is, files will be stored in dest on the local file system with random names. If neither are set, files will be stored in memory.

    In addition to files, all generated middleware process all text fields in the request. For each non-file field, the Request.body object will be populated with an entry mapping the field name to its string value, or array of string values if multiple fields share the same name.
    ```js

      destination:(req,file,cb)=>{
        cb(null,folderName where you want to store file)
      }
      fileName:(req,file,cb)=>{
        cb(null, which type  of name file is saved in DB )
      }
    ```


# HTTP : Hyper Text Transfer Protocol :
   
   * HTTP HEADER : 
  
      * URL : Uniform  Resource Locater
      * URI : Uniform Resource Indicator
      * URN : Uniform Resource  Name
    
    Method : 
     > Get    : Retrieve a Resource
     > Head   : No message  Body (Reponse header only)
     > Options: What Operations are available
     > Trace  : LoopBack test (Get some data)
     > Post   : Interact with Resource (Add value)
     > Patch  : Change part of Resource
     > Put    : Replace a Resource
     > Delete : Reove a Resource

  * HTTP Status Code :

   100-199 : Information    
   200-299 : Success
   300-399 : Redirection 
   400-499 : Clien Site Error
   500-599 : Server site Error

   > Famous Status Code : 

     - 100 : Continue
     - 102 : Processing 
     - 200 : OK
     - 201 : Created 
     - 202 : Accepted
     - 307 : Temporary Redirect
     - 308 : Permanent Redirect
     - 400 : Bad Request 
     - 401 : Unathourised 
     - 402 : Payment Required 
     - 404 : Not Found
     - 500 : Internal Server error
     - 504 : GateWay TimeOut

# Method of JS
   * Some :
   * Select : Specifies which document fields to include or exclude (also known as the query "projection")     

# isValidObjectID: Returns true if Mongoose can cast the given value to an ObjectId,   