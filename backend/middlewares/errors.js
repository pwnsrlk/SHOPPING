const ErrorHandler = require('../utils/errorHandler');


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
  
    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(err.statusCode).json({
            success: false,
            error : err,
            errMessage: err.message,
            stack : err.stack
        })
    }

    if (process.env.NODE_ENV === 'PRODUCTION') {
        let error = {...err}

        error.message = err.message

       //wrong mongoose objectid error
       if(err.name === 'CastError') {
           const message =`resource not found. invalid: ${err.path} `
           error = new ErrorHandler (message, 400)
       }

        // Handling mongoose validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message)
            error = new ErrorHandler (message,400)
        }

        //handling mongoose duplicate key error
        if(err.code===11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler (message,400)
        }
        
        //handling wrong JWT error
        if(err.name === 'JsonWebTokenError'){
            const message = 'Json web token is invalid. try again'
            error = new ErrorHandler (message,400)
        }

        //handling expired JWT error
        if(err.name === 'TokenExpiredError'){
            const message = 'Json web token is expired. try again'
            error = new ErrorHandler (message,400)
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'internal server error'
        })
    }

    
}