const mongoose = require('mongoose')

const pdfSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    desc:{
        type:String,
        required:true,
        trim:true
    },
    category:{
        type:String,
        required:true,
        trim:true
    },
    author:{
        type:String,
        required:true,
        trim:true
    },
    drive_Id : {
        type:String,
        require:true
    },
    webContentLink:{
        type:String,
        required:true
    },
    webViewLink:{
        type:String,
        required:true
    },
    photo:{
        data:Buffer,
        contentType : String,
    },
    status:{
        type:String,
        default:"Processed",
        enum:["Popular","Trending","Cancel","Processing","Processed"]
    },
    download:{
        type:Number,
        default:1,
    }
    
},{timestamps:true})

module.exports = mongoose.model('PDF_File',pdfSchema)