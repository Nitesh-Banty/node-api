
// common method to handled async.. method like a service method 
import { Response,Request } from 'express';
const asyncHandler=(requestHandled:any)=>{
    (req:Request,res:Response,next:any)=>{
      Promise.resolve(requestHandled(req,res,next))
      .catch(err=>next(err))
    }
}
export {asyncHandler};


/*  [ asyncHandler it's a higher order function itself here]
  is function can accept as parameter and return a functions 

const asyncHandler=(func:any)=>{}
const asyncHandler=(func:any)=>{()=>{}}
const asyncHandler=(func:any)=>()=>{}
const asyncHandler=(func:any)=>async()=>{}

const asyncHandler=(fn:any)=>async(req:Request,res:Response,next:any)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(500) //error code 
        .json({
            success:false,
            message:error
        })
    }
}

*/


