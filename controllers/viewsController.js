const AppError = require('../utils/AppError');
const Tour = require('./../models/toursModel');
const User = require('./../models/userModel');
const catchError = require('./../utils/CatchError');
exports.getOverview = catchError(async (req, res, next) => {
  const tours = await Tour.find({});
  res.status(200).render('overview', {
    tours
  });
});
exports.getTour = catchError(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews'
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour
  });
});

exports.getLogin = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log in to your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.updateAccount = catchError(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      email: req.body.email,
      name: req.body.name
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
