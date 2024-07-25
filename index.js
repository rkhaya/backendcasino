const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const { mongoose } = require("mongoose");
const cookieParser = require('cookie-parser')
const app = express();

const corsOrigin ={
    origin:'http://localhost:5173', //or whatever port your frontend is using
    credentials:true,            
    optionSuccessStatus:200
}
app.use(express.json());
app.use(cookieParser())
app.use(cors(corsOrigin))
app.use(express.urlencoded({ extended: false }));


const authRoute = require('./routes/user') // this is where you register your routes
app.use('/user', authRoute)
const gameRoute = require('./routes/gamble')
app.use('/gamble', gameRoute)


//db connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("Database not connected", err));



const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
