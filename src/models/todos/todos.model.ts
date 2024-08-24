import mongoose ,{Document,Schema} from "mongoose";
import { ITodo } from "./todo.model";

export interface ITodoSItem extends Document {
    todos:ITodo[]
}

const TodoItemsSchema= new Schema({
    todos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Todo'
    }]
})

export const Todos = mongoose.model<ITodoSItem>('TodoInfo',TodoItemsSchema)