const express = require('express')
const router = express.Router();
const {preSignup,signup,signin,signout,requireSignin} = require('../controllers/auth');
const {userSigninValidator,userSignupValidator} = require('../validators/user')
const {runValidation} = require('../validators')


router.post("/pre-signup",userSignupValidator,runValidation,preSignup);
router.post("/signup",signup);
router.post("/signin",userSigninValidator,runValidation,signin);
router.get('/signout',signout)

module.exports = router