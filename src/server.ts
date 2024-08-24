import express,{Response,Request} from "express";
import cors from "cors"
import connectDB from "./db/connection";
import route from "./routes/user.route"
require('dotenv').config();

connectDB();



const app=express();
const port =3001;

// allow all trafic
app.use(cors())

app.listen(port,()=>{
    console.log(`api listening on port ${port}`)
})


app.use(route);



