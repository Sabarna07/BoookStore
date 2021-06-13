const {check} = require('express-validator')

exports.userSignupValidator =[
    check("name")
        .not()
        .isEmpty()
        .withMessage("Name is required"),
    
    check("email")
        .isEmail()
        .withMessage("Must be a valid email"),

    check("password")
        .isLength({min:6})
        .withMessage("Password must be of 6 character long")
]

exports.userSigninValidator =[
    check("email")
        .not()
        .isEmpty()
        .isEmail()
        .withMessage("Must be a valid email"),

    check("password")
        .not()
        .isEmpty()
        .isLength({min:6})
        .withMessage("Password must be of 6 character long")
]