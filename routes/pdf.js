const express = require('express')
const router = express.Router()
const multer = require('multer')

const {helloWorld, pdfUpload, getAllFiles, getFileById,getPdfBySearch,download, photo,getpdfByCategory, updatePdf, removePdf,getStatusValues,updateStatusValues,updateDownloadCount} = require('../controllers/pdf')
const {requireSignin,isAdminMiddleware} = require('../controllers/auth')
const {pdfUploadValidator} = require('../validators/pdf')
const {runValidation} = require('../validators')



const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
        //  cb(null,'./uploads')
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

// router.post('/upload',requireSignin,isAdminMiddleware,type,pdfUpload)


router.get('/getfiles',getAllFiles);
router.get('/getfile/:id',getFileById);
router.get('/getpdf/search',getPdfBySearch);
router.get('/getpdf-category/:category',getpdfByCategory);

router.get('/pdf/photo/:id',photo);
// router.get('/download/:id',download)

router.put('/pdf/update/:id',requireSignin,isAdminMiddleware,updatePdf)
router.delete('/pdf/remove/:id',requireSignin,isAdminMiddleware,removePdf)

//pdf status
router.get('/pdf/status',getStatusValues)
router.put('/pdf/update/status/:id',updateStatusValues)

//download count update
router.put('/pdf/download/count/:id',updateDownloadCount)

module.exports = router