const AppError = require('../utils/AppError');

const sendErrorDev = (err, req, res) => {
  const statusCode = err.statusCode || 500;
  //API ERRORS
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      name: err.name,
      error: err,
      stack: err.stack
    });
  } else {
    // WEB ERRORS
    res.status(statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
};
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      res.status(500).json({
        status: 'Error',
        message: 'Something went wrong...'
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
      });
    } else {
      res.status(500).render('error', {
        title: 'Something went wrong',
        msg: 'Something went wrong...'
      });
    }
  }
};
const handleCastErrorDB = (err) => {
  message = `Field ${err.path} : ${err.value} invalid value `;
  return new AppError(message, 400);
};
const handleDuplicateError = (err) => {
  const duplicated = JSON.stringify(err.keyValue);
  message = `Duplicate value ${duplicated}`.replace('\\"', ' ');
  return new AppError(message, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => {
    return el.message;
  });

  const message = `Invalid input data . ${errors.join('')}`;
  return new AppError(message, 400);
};

///INVALID TOKEN ERROR HANDLER

const handleInvalidToken = (err) => {
  const message = 'Invalid Token. Please try to login again!';
  return new AppError(message, 401);
};
/// TOKEN EXPIRED ERROR
const handleTokenExpiration = (err) => {
  const message = 'This token has expired. Please login again!';
  return new AppError(message, 401);
};

///////
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // HERE WE CLONE THE ERR OBJECT, THAT HAVE CERTAIN NON ENNUMERABLE PROPERTIES
    let error = {};
    Object.getOwnPropertyNames(err).forEach(function (property) {
      error[property] = err[property];
    });

    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateError(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (err.message === 'invalid signature') {
      error = handleInvalidToken(error);
    }
    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiration(error);
    }

    sendErrorProd(error, req, res);
  }
};
