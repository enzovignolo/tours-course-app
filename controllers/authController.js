const User = require('./../models/userModel');
const catchError = require('./../utils/CatchError');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { promisify } = require('util');
const { token } = require('morgan');
const { exists } = require('./../models/userModel');
const Email = require('../utils/EmailSender');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: process.env.EXP_TOKEN_TIME
  });
};

const createAndSendToken = (user, res, req, statusCode) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.EXP_COOKIE_TIME * 24 * 60 * 60 * 1000
    ),
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    httpOnly: true
  };
  /* if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    cookieOptions.secure = true;
  }
 */
  res.cookie('token', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token
    /* token */
  });
};

exports.signUp = catchError(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser._id, res, req, 201);
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

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  createAndSendToken(user._id, res, req, 201);
});

exports.protect = catchError(async (req, res, next) => {
  //GET TOKEN
  //from web
  if (req.cookies) {
    req.headers.authorization = 'Bearer ' + req.cookies.token;
  }

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
  res.locals.user = user;
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

// Reset Password Functionality

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body; // get the email from request
  const user = await User.findOne({ email }); // find the user in the DB.

  if (!user) {
    ///Check if user stil exists
    return next(new AppError('Invalid email!', 400));
  }

  // Generate Random token
  const resetToken = await user.createResetToken(); // so we only save the reset token and its creation date
  // Hash and store the token
  await user.save({ validateBeforeSave: false });
  const url = `${req.protocol}://${req.host}:${process.env.PORT}/api/v1/users/reset-password/${resetToken}`;

  try {
    /* const mailOptions = {
      to: user.email,
      subject: 'Reset Password - 10 minutes expirations',
      message: `To reset passowrd please submit a PATCH request to ${url} with the new password and password confirmation`
    };
    await sendMail(mailOptions);
    */
    await new Email(user, url).sendPasswordReset();

    res.status(200).json({
      status: 'Email was sent!'
    });
  } catch (err) {
    // RESET TOKEN AND EXPIRATION DATE IF AN ERROR OCCURS
    user.resetTokenExpirationDate = undefined;
    user.passwordResetToken = undefined;
    next(new AppError('Error sending the email, please try again', 500));
  }

  //Send it by email
};

exports.resetPassword = catchError(async (req, res, next) => {
  // First we encrypt the token to find it in our DB

  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetToken,
    resetTokenExpirationDate: { $gt: Date.now() } //This query filter is to check if token has expired.
  });
  //Check if user exist or token has expired
  if (!user) {
    return next(new AppError('User does not exist or token has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  user.passwordResetToken = undefined;
  user.resetTokenExpirationDate = undefined;
  user.save();
  //LOG IN THE USER
  /* const token = signToken(user._id);
  res.status(201).json({
    status: 'Succesfully logged in',
    token
  }); */
  createAndSendToken(user._id, res, req, 201);
  next();
});

exports.updatePassword = catchError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // VERIFY USER PASSWORD
  const oldPassword = req.body.password;
  if (!(await user.comparePassword(oldPassword, user.password))) {
    return next(new AppError('Password not correct, log in again!'), 401);
  }
  if (!(req.body.newPassword === req.body.passwordConfirmation)) {
    return next(
      new AppError(
        'Password and confirmation does not match, please check and try again',
        400
      )
    );
  }
  user.password = req.body.newPassword;
  user.passwordConfirmation = req.body.passwordConfirmation;
  await user.save({});

  //LOGIN AGAIN
  createAndSendToken(user._id, res, req, 200);
});

//CHECK IF USER IS LOGGED IN FROM WEB ACCESS
exports.isLoggedIn = async (req, res, next) => {
  //GET TOKEN
  try {
    if (req.cookies.token) {
      const token = req.cookies.token;
      // VERIFY TOKEN

      const verifiedToken = await promisify(jwt.verify)(
        token,
        process.env.SECRET
      );
      // CHECK IF USER STILL EXISTs
      const user = await User.findById(verifiedToken.id);

      if (!user) {
        return next();
      }
      // CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED

      if (await user.passwordChanged(verifiedToken.iat)) {
        return next();
      }
      res.locals.user = user;
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
};

exports.logOut = (req, res, next) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};
