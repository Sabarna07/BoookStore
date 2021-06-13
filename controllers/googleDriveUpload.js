const {google} = require('googleapis')
const express = require('express')
const multer = require('multer')
const router = express.Router()
const fs = require('fs')
const {requireSignin,isAdminMiddleware} = require('./auth')
const {uploadFile} = require('./GoogleDrive')

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN


const Oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
Oauth2Client.setCredentials({refresh_token : REFRESH_TOKEN})

//multer storage
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        if(file.fieldname === 'pdf')
        {
            cb(null,'./uploads')
        }
        if(file.fieldname === 'photo')
        {
            cb(null,'./images')
        }
    },
    filename:(req, file, cb)=> {
        cb(null, `${new Date().getTime()}_${file.originalname}`)
    },
});
const upload = multer({storage:storage})
var type = upload.fields([{name:'pdf', maxCount:1},{name:'photo' , maxCount:1}]);

//drive initialize
const drive = google.drive({
    version : 'v3',
    auth : Oauth2Client
})
//file upload to drive
// UploadFile = (filename,mimetype,path) =>{
//     try {
//         drive.files.create({
//             requestBody:{
//                 name:filename,
//                 mimeType: mimetype
//             },
//             media: {
//                 mimeType : mimetype,
//                 body:fs.createReadStream(path)
//             }
//         },(err,file)=>{
//             if(err){console.log(err)}
//             else{return file.data}
//         })
//         // return response.data
//     } catch (error) {
//         console.log(error)
//     }
// }
//delete file
// async function DeleteFile(id){
//     try {
//         const response  = await drive.files.delete({
//             fileId: id
//         })
//         console.log(response.data,response.status)
//     } catch (error) {
//         console.log(error)
//     }
// }

router.post("/google-drive-upload",requireSignin,isAdminMiddleware,type,(req,res)=>{
        const {pdf,photo} = req.files
        const {title,desc,category,author} = req.body
        const {filename,mimetype,path} = pdf[0]

        if(pdf && photo && title && desc && category && author){
            drive.files.create({
                requestBody:{
                    name:filename,
                    mimeType: mimetype
                },
                media: {
                    mimeType : mimetype,
                    resumable: true,
                    body:fs.createReadStream(path),
                }
            },(err,file)=>{
                if(err){
                    console.log(err)
                }
                else{
                    fs.unlinkSync(path)
                    // console.log(file.data)
                    var sendData = new Object()
                    const {id} = file.data

                    drive.permissions.create({
                        fileId:id,
                        requestBody:{
                            role:'reader',
                            type:'anyone'
                        }
                    })
                    drive.files.get({
                        fileId:id,
                        fields:'webViewLink , webContentLink'
                    },(err,results)=>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            const {webContentLink,webViewLink} = results.data
                            // webContentLink = results.data.webContentLink
                            // webViewLink = results.data.webViewLink
                            sendData.webContentLink = webContentLink
                            sendData.webViewLink = webViewLink
                        }
                    })
                    sendData.id = id
                    sendData.title = title
                    sendData.desc = desc
                    sendData.category = category
                    sendData.author = author
                    sendData.photo = photo

                    setTimeout(() => {
                        uploadFile(sendData)
                        res.json({
                            message:"File uploaded successfully"
                        })
                    }, 2000);
                }
            })
        }
        else{
            return res.status(400).json({
                error:'All feilds and files are required'
            })
        }
       
})


module.exports = router
