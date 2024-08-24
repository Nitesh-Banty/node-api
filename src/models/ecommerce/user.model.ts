import mongoose, { Schema, Document } from 'mongoose';

export interface IUsers extends Document {
    id: number,
    email: string,
    age: string,
    _id: string
  }

const UserSchema: Schema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  age: { type: String, required: true },
  _id: { type: String, required: true },
});

export default mongoose.model<IUsers>('User', UserSchema);