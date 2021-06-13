const User = require('../model/user')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const nodemailer = require("nodemailer");
var handlebars = require('handlebars');
var fs = require('fs');
const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI
const REFRESH_TOKEN = process.env.GOOGLE_EMAIL_REFRESH_TOKEN

const Oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
Oauth2Client.setCredentials({refresh_token : REFRESH_TOKEN})
const accessToken = Oauth2Client.getAccessToken()


exports.preSignup = (req,res) =>{
    const {name,email,password} = req.body

    User.findOne({email}).exec((err,user)=>{
        if(err || user){
            return res.status(400).json({
                error:"Email already in use"
            })
        }
        const token = jwt.sign({name,email,password},process.env.ACCOUNT_ACTIVATION,{expiresIn:'5m'})

        //nodemailer part
        let transporter = nodemailer.createTransport({
            service:"gmail",
            auth: {
                type: "OAuth2",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
                user: process.env.NODEMAILER_EMAIL, 
                pass: process.env.NODEMAILER_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

    var readHTMLFile = function(path, callback) {
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };

      readHTMLFile(__dirname + '/mail.html', function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            name: name,
            url:`${process.env.CLIENT_URL}/auth/activate/${token}`
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: "Book Store <developer.mail.inuse@gmail.com>",
            to : email,
            subject: "Account Activation Link",
            html : htmlToSend
         };
         transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                // callback(error);
            }
            else{
                console.log(`Email sent ${email}`)
                return res.json({
                    message:'Email sent. Also check your spam folder'
                })
            }
        });
    });

    })
}

// exports.signup = (req,res) =>{
//     // console.log(req.body)
    
//     User.findOne({email:req.body.email}).exec((err,user)=>{
//         if(user){
//             res.status(200).json({
//                 error:'Email already exists'
//             })
//         }
//         const {name,email,password} = req.body;
//         let newUser = new User({name,email,password});
//         newUser.save((err,result)=>{
//             if(err){
//                 return res.status(400).json({
//                     error:err
//                 })
//             }
//             return res.json({
//                 message:'Signup successful ! Please signin'
//             })
//         })
//     })
// }

exports.signup = (req,res) =>{
    const {token} = req.body

    if(token){
        jwt.verify(token,process.env.ACCOUNT_ACTIVATION, function(err,decode){
            if(err){
                return res.status(400).json({
                    error:"Link expired. Signup again"
                })
            }
            // console.log(decode)
            const {name,email,password} = jwt.decode(token);
            let newUser = new User({name,email,password})
            newUser.save((err,result)=>{
                if(err){
                    return res.status(400).json({
                        error:err
                    })
                }
                return res.json({
                    message:'Signup successful ! Please signin'
                    })
                })
        })
    }
}


exports.signin = (req,res) =>{
    // console.log(req.body);
    const {email,password} = req.body

    User.findOne({email}).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:'Email not found. Please signup'
            })
        }
        //authenticate password
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:"Email and password do not match"
            })
        }
        //generate token and send to client
        const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'1d'});
        
        res.cookie("token", token, { expiresIn: "1d" });
        const { _id, name, email, role } = user;
        return res.json({
            token,
            user: { _id, name, email, role },
        });
    })
}

exports.signout = (req,res) =>{
    res.clearCookie('token');
    res.json({
        message:'Signout successfull'
    })
}

exports.requireSignin = expressJwt({
    secret:process.env.JWT_SECRET,
    algorithms:["HS256"],
})

exports.isAdminMiddleware = (req, res, next) => {
    const adminUserId = req.user._id;
    console.log(adminUserId)
    User.findById({ _id: adminUserId }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      if (user.role !== 1) {
        return res.status(400).json({
          error: "Access Denied",
        });
      }
      req.profile = user;
      next();
    });
  };
