const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');
const { send } = require('process');
const cloudinary = require('cloudinary');

// register a user =>/api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: "scale"
    })

   const {name, email, password} = req.body;

   const user = await User.create({
       name,
       email,
       password,
       avatar: {
        public_id: result.public_id,
        url: result.secure_url
       }
   })

   sendToken(user, 200,res)

})



//login user =>/api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const {email, password} = req.body;

    //check if email and password are entered by user
    if(!email || !password){
        return next(new ErrorHandler('please enter email and password',400))
    }

    // find the user in the database
    const user = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorHandler('invalid emai or password',401));
    }

    //check if password  correct
    const isPasswordMatched =await user.comparePassword(password)


    if(!isPasswordMatched){
        return next(new ErrorHandler('invalid emai or password',401));
    }
    sendToken(user, 200,res)
})

//forgot password => /api/v1/password/forgot 
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findOne({ email : req.body.email});


    if(!user){
        return next(new ErrorHandler('user not found with this email',404));
    }
     
    //get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false });

    //create reset password url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    const message = `your password reset token is as follow:\n\n${resetUrl}\n\nif you have not requestedthis email ignore it .`


    try {

        await sendEmail({
            email: user.email, 
            subject: 'SHOPING password recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `email sent to ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false });

        return next(new ErrorHandler(error.message,500))
    }
    
})

//reset password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

 
    //Hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');


    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire :{ $gt: Date.now()}
    })
    if(!user) {
        return next(new ErrorHandler('reset token invalid or expired',400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('password does not match',400))
    }

    //setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

   await user.save();

   sendToken(user, 200,res)


})

//get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
    success: true,
    user

    })
})


//update/change password => /api/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
const user = await User.findById(req.user.id).select('+password');

//check previous user password
const isMatched = await user.comparePassword(req.body.oldPassword)
if(!isMatched) {
    return next(new ErrorHandler('old password is incorrect',400));
}

  user.password = req.body.password;
  await user.save();

  sendToken(user, 200,res)

})

//update user profile => /api/v1/me/update
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }
    //update avatar 
    if (req.body.avatar !== '') {
        const user = await User.findById(req.user.id)

        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar ={
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators: true,
        useFindAndModify:false
    })
    res.status(200).json({
        success: true,
    })
})

//logout user => /api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token',null, {
        expires: new Date(Date.now()),
        httpOnly:true
    }),
    res.status(200).json({
        success: true,
        message:'logged out'
    })
})

//admin routes

//get all users => /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

//get specific user =>/api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`ures does not found by id: ${req.params.id}`));
    }
     res.status(200).json({
         success : true,
         user
     })


})

//update user profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email, 
        role: req.body.role
    }
    

    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators: true,
        useFindAndModify:false
    })
    res.status(200).json({
        success: true,
    })
})
// delete user
exports.deleteUser = catchAsyncErrors (async (req, res, next) => {

    const user = await User.findById(req.params.id);
 
     if(!user){
        return next(new ErrorHandler('No user found', 404));
     }

     //remove avatar :todo
     await user.remove();

     res.status(200).json({
         success : true,
         message : "user is deleted"
     })
 })
