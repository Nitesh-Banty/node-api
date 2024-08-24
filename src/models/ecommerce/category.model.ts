import { Timestamp } from "mongodb";
import mongoose, { Schema, model }  from "mongoose";   
interface ICategory{
    name:string
}

const categorySchema=new Schema<ICategory>({
    name:{
        type:String,
        require:true
    }
},{timestamps:true})

export const Category = mongoose.model<ICategory>('Category',categorySchema);