const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchError = require('../utils/CatchError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = factory.getAll(User);
/* catchError(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    status: 'Success',
    users
  });
}); */

exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    data: 'Route not defined yet'
  });
};

exports.updateMe = catchError(async (req, res, next) => {
  //Find the user
  const user = User.findById(req.user.id);
  //Check that user does not want to update his password from here
  if (req.body.password || req.body.passwordConfirmation) {
    return next(
      new AppError(
        'You can not update the password from here. To do that please use /update-password',
        400
      )
    );
  }

  //Update the data (filtering the kind of data first.)
  const updateObj = filterObj(req.body, 'name', 'email');
  const newUser = await User.findByIdAndUpdate(req.user.id, updateObj, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    user: newUser
  });
});

exports.deleteMe = catchError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    data: null
  });
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
