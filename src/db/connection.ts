import mongoose from 'mongoose';
import { DB_Name } from '../constants';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`); // change database name in env file 
   // console.log(` \n MongoDB connected successfully !! DB HOST`);
  } catch (error) {
    //console.error('MongoDB connection error:', error);
    throw error;
    process.exit(1);
  }
};
export default connectDB;

/*
//using effy
;(async()=>{
  try {
  await mongoose.connect(`${process.env.MONGODB_URI}`);
  } catch (error) {
    console.error('ERROR',error);
    throw error;
  }
})()
  */