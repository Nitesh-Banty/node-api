import { Router } from 'express'
import {registerUser,getAllUsers} from "../controllers/user.controllers";

type Item = {
  id: number,
  name: string
}

const router = Router();

router.route('/register').post(
  registerUser)

router.route('/getUsers').get(
  getAllUsers
)

export default router;