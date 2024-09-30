import cors from "cors";
import express, { Router } from "express";
import cookieParser from "cookie-parser"
import { asyncHandler } from "./utils/asyncHandler";

import { Request, Response } from 'express';


const app=express();
// middleware configurations
// allow all trafic   //todo: read documentation for better understanding
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:'24kb'}))  // now no need to use body parser 
//when come data from the url 
app.use(express.urlencoded({extended:true,limit:'30kb'}))
// for store file, images , videos  in a public folder any one can access this folder 
app.use(express.static('public'))


// about cookieParser use : from my server to user browser's cookies can access and set his cookies 
// we can perform crud operation user browser cookie's 

/* middle ware - 
  (err,req,res,next)
  * next for only  is middleware flag
*/
app.use(cookieParser())

// routes import
import testRouter from "./routes/test.route";
import userRouter from "./routes/user.route";


//routes declaration
app.use("/api/v1/users",userRouter)


export {app};