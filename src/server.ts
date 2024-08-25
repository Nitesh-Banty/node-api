import express, { Response, Request } from "express";
import cors from "cors"
import connectDB from "./db/connection";
import route from "./routes/user.route"
import { app } from "./app";
require('dotenv').config();

connectDB()
    .then(() => {
        console.log(` \n MongoDB connected successfully !! DB HOST`);
        app.listen(process.env.PORT ?? 3001, () => {
            console.log(`api listening on port ${process.env.PORT}`)
        })
        app.use(route)
    })
    .catch((error) => {
        console.log('MONGODB ERROR: Connection FAILED !!! ', error)
        app.on('Error',()=>{
            console.log('ERR: Connection FAILED !!! ', error)
            throw error;
        })
    })






