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

const userController = asyncHandler(async (req: Request, res: Response) => {
    // to do call service / methods 
    res.status(200).json({
        message: "ok"
    })
})

export { userController }