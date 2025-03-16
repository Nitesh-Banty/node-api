import express, { Response, Request } from "express";
import cors from "cors"
import connectDB from "./db/connection";
import route from "./routes/user.route"
import { app } from "./app";
import { WebSocketManager } from "./websocket/WebSocketManager";
//import testRouter from "./routes/test.route";

require('dotenv').config();

// first connect to database then run app 
connectDB()
    .then(() => {
        console.log(` \n MongoDB connected successfully !! DB HOST`);
       const server = app.listen(process.env.PORT ?? 3001, () => {
            console.log(`api listening on port ${process.env.PORT}`)
        })
        // we are running both ws or http in same port
        new WebSocketManager(server);

        // Handle graceful shutdown
        // process.on('SIGTERM', () => {
        //   console.log('SIGTERM received. Shutting down gracefully');
        //   server.close(() => {
        //    console.log('Server closed');
        //     process.exit(0);
        //   });
        // });
        //app.use('api/v1/test',testRouter)
        //app.use(route)
    })
    .catch((error) => {
        console.log('MONGODB ERROR: Connection FAILED !!! ', error)
        app.on('Error',()=>{
            console.log('ERR: Connection FAILED !!! ', error)
            throw error;
        })
    })






