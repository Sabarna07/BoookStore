const {check} = require('express-validator')

exports.pdfUploadValidator =[
    check("title")
        .not()
        .isEmpty()
        .withMessage("Title is required"),
    
    check("desc")
        .not()
        .isEmpty()
        .withMessage("Description is required"),

    check("category")
        .not()
        .isEmpty()
        .withMessage("category is required")
]