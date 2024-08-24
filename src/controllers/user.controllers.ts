const userService = require('../services/user.service.ts');
import { Request,Response } from 'express';

const getAlls=(req:Request,res:Response)=>{
    res.send(userService.getAll(req,res))
}
const get=(req:Request,res:Response)=>{
    res.send(userService.get(req.body))
}

module.exports={
    getAlls
}
