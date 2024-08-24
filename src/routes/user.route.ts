import {Router} from 'express'

type Item={
  id:number,
  name:string
}

const router=Router();
const userRout=require('../controllers/user.controllers')
router.get('/customers',(req,res)=>{
      userRout.getAlls(req,res);
})

router.get('/login',(req,res)=>{
    userRout.get(req,res);
})

export default router;