//const userService = require('../services/user.service.ts');
import { Request, Response } from 'express';

// const getAlls=(req:Request,res:Response)=>{
//     res.send(userService.getAll(req,res))
// }
// const get=(req:Request,res:Response)=>{
//     res.send(userService.get(req.body))
// }

// module.exports={
//     getAlls
// }

// todo we are use async order a higher order function 

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from '../utils/ApiError';
import User from '../models/youtube/user.model';
import { ApiResponse } from '../utils/ApiResponse';

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username,email,fullName,password} =req.body;
    console.log('username',username,'email',email,'fullName',fullName)

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with mail or username already exist")
    }

     const user=await User.create({
        fullName,
        email,
        username,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

   return res.status(201).json(
       new ApiResponse(200, createdUser, "User registered Successfully",true)
    )
})

// get user in database 
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find().select("-password -refreshToken");
    return res.json(new ApiResponse(200, users, "Users retrieved successfully",true));
});

export { registerUser,getAllUsers }