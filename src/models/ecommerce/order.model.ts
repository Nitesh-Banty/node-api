import mongoose, { Schema } from "mongoose";
import { IProduct } from "./product.model";

interface IOrder{
    price:number,
    customerId:mongoose.Schema.Types.ObjectId,
    orderItems:IOrderItems[],
    address:string,
    status:string
}
interface IOrderItems{
    productId:mongoose.Schema.Types.ObjectId,
    quantity:number
}



const orderItemsSchema=new Schema<IOrderItems>(
    {
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        },
        quantity:{
            type:Number,
            require:true
        }
    }
)

const orderSchema=new Schema<IOrder>(
    {
     price:{
        type:Number,
        default:0
     },
     customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
     },
     orderItems:{
        type:[orderItemsSchema]
     },
     address:{
        type:String
     },
     status:{
       type:String,
       enum:['PENDING','DELIVERED','CANCELED'],
       default:'PENDING'
     }
    },
    {timestamps:true}
)

export const Product=mongoose.model<IOrder>('Product',orderSchema);