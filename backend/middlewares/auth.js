const User = require('../models/user')

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
//checks if user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next)=>{

   const  {token} = req.cookies;

  if(!token){
      return next(new ErrorHandler('login first to access this resorce',401))
  }
    
     const decoded = jwt.verify(token, process.env.JWT_SECRET)
     req.user = await User.findById(decoded.id)

     next()

})
//handle user roles
exports.autherizeRoles =(...roles) => {
 return (req, res, next) => {
     if(!roles.includes(req.user.role)){
         return next(
         new ErrorHandler(`Role(${req.user.role}) is not allowed to access`,403))
     }
    next();
 }  
}