const data = require('../data')

import Item, { IUsers } from '../../src/models/users';
import { Request, Response } from 'express';

// we need aa database helper here 
// get data from database 

const get=(_email:string)=>{
    //return getAll().find(item=>item.email===_email)
}

const  getAll=async(req:Request,res:Response)=>{
    const items: IUsers[] = await Item.find();
    res.json(items);
   // return  data.Customers;
}

// we need to export this methods 
module.exports = {
    get,
    getAll
};