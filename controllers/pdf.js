const path = require('path')
const fs = require('fs')
const multer = require('multer')
const PDF_File = require('../model/pdf');
const pdf = require('../model/pdf');
const _ = require('lodash')
const formidable = require('formidable')



exports.pdfUpload = (req,res) =>{

    const {title, desc, category} = req.body

    if(!req.files.pdf && !req.files.photo){
        return res.status(400).json({
            error:"Image and Pdf file required"
        })
    }
    else{
        const pdfFile = new PDF_File()
        pdfFile.title = title
        pdfFile.desc = desc
        pdfFile.category = category
        pdfFile.file_path = req.files.pdf[0].path
    
        // pdfFile.file_path = req.files.pdf[0].path
        if(req.files.photo)
        {
            pdfFile.photo.data = fs.readFileSync(req.files.photo[0].path);
            pdfFile.photo.contentType = req.files.photo[0].mimetype;
        }
    
    
        pdfFile.save((err,data)=>{
            if(err){
                return res.status(400).json({
                    error:err
                })
            }
            res.json({
                message:"File uploaded successfully"
            })
        })
    }
};


exports.getAllFiles = (req,res) =>{
    PDF_File.find().exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        res.json(data)
    })
};

exports.getFileById = (req,res) =>{
    const _id = req.params.id
    // console.log(_id)
    PDF_File.find({_id}).select('-photo').exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        res.json(data)
    })
}

exports.getPdfBySearch = (req,res) =>{
    const {search} = req.query;
    const newSearch = search.trim()
    // console.log(newSearch)
    if(search){
        PDF_File.find({$or:
            [
                {title:new RegExp(newSearch,"i")},
                {category:new RegExp(newSearch,"i")},
                {desc:new RegExp(newSearch,"i")}
            ]
        },
        (err,pdf)=>{
            if(err){
                return res.status(400).json({
                    error:err
                });
            }
            else if(pdf.length>0){
                res.json(pdf)
            }
            else{
                res.json({
                    message:'No such books found'
                })
            }
        }
        ).select("-photo")
    }
}

exports.getpdfByCategory = (req,res)=>{
    const category = req.params.category;
    // console.log(category)
    PDF_File.find({category}).select('-photo').exec((err,pdf)=>{
        if(err){
            return res.status(400).json({
                error:err
            });
        }
        // console.log(pdf)
        res.json(pdf)
    })
}

exports.download = (req,res) =>{
    const pdfId = req.params.id
    PDF_File.findById({_id: pdfId}).exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        const path = `${__basedir}\\${data.file_path}`
    
        fs.readFile(path , function (err,data){
            if (err) res.status(400).send(err);
                res.contentType('application/pdf')
                   .send(`data:application/pdf;base64,${new Buffer.from(data).toString('base64')}`);
            });
        
        })
    }


// const path = __basedir + "/uploads";
    // fs.readdir(path,(err,files)=>{
    //     if(err){
    //         return res.status(400).json({
    //             message:'File not found';
    //         })
    //     }
    //     let fileList = [];
    //     files.forEach((file)=>{
    //         fileList.push({
    //             name: file,
    //             url : URL + file
    //         });
    //     });
    //     res.status(400).json({fileList});
    // })





exports.photo = (req,res) =>{
    const _id = req.params.id;
    PDF_File.find({_id}).select("photo")
        .exec((err,pdf)=>{
            if(err){
                return res.status(400).json({
                    error:err
                });
            }
            // res.json(pdf)
            res.set("Content-Type", pdf[0].photo.contentType);
            return res.send(pdf[0].photo.data);
            // res.json(pdf.photo)
            // console.log(pdf[0].photo)
        })
}

exports.updatePdf = (req,res) =>{
    const _id = req.params.id
    PDF_File.findOneAndUpdate({_id}).exec((err,pdf)=>{
        if(err){
            return res.status(400).json({
                error : err
            });
        }

        let form = new formidable.IncomingForm()
        form.keepExtensions = true;
        form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error : 'Image could not upload'
            });
        }
        // let updatePdf = req.form;
        pdf = _.merge(pdf,fields)

        // console.log(pdf)

        pdf.save((err,result)=>{
            if(err){
                return res.status(400).json({
                    error : err
                });
            }
            res.json( result );
        })
    })

    })
}

exports.removePdf = (req, res) => {
    const _id = req.params.id;
    PDF_File.findOneAndRemove({ _id }).exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json({
        message: "Deleted Successfully",
      });
    });
  };

exports.getStatusValues = (req,res) =>{
    res.json(PDF_File.schema.path('status').enumValues);
}

exports.updateStatusValues = (req,res) =>{
    const {id,status} = req.body
    // console.log(id + " " +status)
    // let updatedStatus = JSON.stringify(req.body.status)
    // console.log(updatedStatus)
    PDF_File.updateOne({_id:id},{$set:{status:status}},(err,data)=>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        res.json(data)
    })
}


//download count
exports.updateDownloadCount = (req,res) =>{
    console.log(req.params.id)
    PDF_File.updateOne({_id:req.params.id},{$inc:{download:1}},(err,result)=>{
        if(err){
            console.log(err)
            return res.status(400).json({
                error:err
            })
        }
        res.json(result)
    })
}