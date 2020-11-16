const User = require('../models/userModel');
const catchError = require('../utils/CatchError');

exports.getAllUsers = catchError(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    status: 'Success',
    users
  });
});
exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'Success',
    data: 'User Log correctly'
  });
};
exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    data: 'Route not defined yet'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    data: 'Route not defined yet'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    data: 'Route not defined yet'
  });
};
