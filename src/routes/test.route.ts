import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from 'express';

const router = Router();

const userController = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      message: "nitesh test"
    })
  })

router.route('/').post(userController)

export default router;

