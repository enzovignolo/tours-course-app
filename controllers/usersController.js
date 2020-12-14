const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const multer = require('multer');
const catchError = require('../utils/CatchError');
const factory = require('./handlerFactory');
const sharp = require('sharp');

//UPLOAD PHOTO FUNCTIONALLITY
/* const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    //HERE WE CREATE AN UNIQUE FILE NAME FOR THE PHOTO
    const ext = file.mimetype.split('/')[1]; // the mimetype is like IMG/jpeg
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});
 */
const multerFilter = (req, file, cb) => {
  //CHECK IF THE FILE IS AN IMG
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, Please upload only images.', 400), false); //PASS AN ERROR
  }
};

const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchError(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

////

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
  if (req.file) updateObj.photo = req.file.filename; //CHECK IF THE USER IS UPLOADING AN IMG

  const newUser = await User.findByIdAndUpdate(req.user.id, updateObj, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
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
