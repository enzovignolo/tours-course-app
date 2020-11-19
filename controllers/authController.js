const User = require('./../models/userModel');
const catchError = require('./../utils/CatchError');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { promisify } = require('util');
const { token } = require('morgan');
const { exists } = require('./../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: process.env.EXP_TOKEN_TIME
  });
};

exports.signUp = catchError(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = jwt.sign({ id: newUser._id }, process.env.SECRET, {
    expiresIn: process.env.EXP_TOKEN_TIME
  });
  res.status(201).json({
    status: 'User Created!',
    token,
    name: newUser.name,
    password: newUser.password,
    passwordConfirmation: newUser.passwordConfirmation,
    email: newUser.email
  });
});

exports.logIn = catchError(async (req, res, next) => {
  //get the information from the body
  const { email, password } = req.body;
  //look for the user with that emai;
  const user = await User.findOne({ email }).select('+password');

  //check if user and password were passed..
  if (!email || !password) {
    return next(new AppError('Please input an email and passowrd', 400));
  }

  if (!user || (await user.comparePassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = signToken(user._id);
  res.status(201).json({
    status: 'Succesfully logged in',
    token
  });
});

exports.protect = catchError(async (req, res, next) => {
  //GET TOKEN
  if (!req.headers.authorization) {
    return next(new AppError('Please provide a token', 400));
  }
  const token = req.headers.authorization.split(' ')[1];
  const { email } = req.body;

  // VERIFY TOKEN

  const verifiedToken = await promisify(jwt.verify)(token, process.env.SECRET);

  // CHECK IF USER STILL EXISTs
  const user = await User.findById(verifiedToken.id);

  if (!user) {
    return next(new AppError('User does not longer exists', 401));
  }
  // CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED

  if (await user.passwordChanged(verifiedToken.iat)) {
    return next(
      new AppError(
        'Password changed since last login. Please log in again',
        401
      )
    );
  }
  req.user = user;
  next();
});

// MIDDLEWARE TO CHECK THE USER'S ROLE

exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError('Your user have no permission to perform this action', 401)
      );
    }
    next();
  };
};
