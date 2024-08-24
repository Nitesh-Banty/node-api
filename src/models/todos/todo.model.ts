import mongoose,{Document, Schema} from "mongoose";

export interface ITodo extends Document {
    id: string,
    item: string,
    isCompleted: boolean,
  }

  const TodoSchema:Schema= new Schema(
    {
        id:{type:String,require:true},
        item:{type:String,require:true},
        isCompleted:{type:Boolean,default:false}
    },
    {timestamps:true})

    export const Todo= mongoose.model<ITodo>('Todo',TodoSchema)