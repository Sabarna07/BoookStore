const express = require('express')
const mongodb = require("mongodb")
const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')
require('dotenv').config()
const expressValidators = require('express-validator');

global.__basedir = __dirname;

//app
const app = express()

//Bring Routes
const pdfRoutes = require('./routes/pdf')  
const authRoutes = require('./routes/auth')  
const googleRoutes = require('./controllers/googleDriveUpload')  

//Middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

//cors
if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

//Routes middleware
app.use('/api',pdfRoutes)
app.use('/api',authRoutes)
app.use('/api',googleRoutes)

//Database connection
mongoose.connect((process.env.MONGO_URI),{useNewUrlParser: true , useUnifiedTopology: true})
  .then(()=>console.log('Database connected'))

mongoose.connection.on('error',(err)=>{
  console.log(`DB connection error : ${err.message}`)
})

//Server Listen
const PORT = process.env.PORT || 8000
app.listen((PORT),()=>{
  console.log(`Server listenning at ${PORT}`)
})