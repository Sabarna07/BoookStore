const PDF_File = require('../model/pdf');
const fs = require('fs')

exports.uploadFile = (sendData) =>{
    // console.log(sendData)
    const {id,title,desc,category,author,photo,webContentLink,webViewLink} = sendData

    const pdfFile = new PDF_File()

    pdfFile.title = title
    pdfFile.desc = desc
    pdfFile.category = category
    pdfFile.author = author
    pdfFile.drive_Id = id

    pdfFile.webContentLink = webContentLink
    pdfFile.webViewLink = webViewLink

    pdfFile.photo.data = fs.readFileSync(photo[0].path);
    pdfFile.photo.contentType = photo[0].mimetype;

    fs.unlinkSync(photo[0].path)

    pdfFile.save((err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            
        }
    })

}