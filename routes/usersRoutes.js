///// DEPENDENCIES ////
const express = require('express');
const multer = require('multer');
const usersController = require(`../controllers/usersController`);
const authController = require('./../controllers/authController');
/////
//MIDDLEWARE

const upload = multer({ dest: 'public/img/users' });

const router = express.Router();

////////////////////////

router.post('/sign-up', authController.signUp);
router.post('/log-in', authController.logIn);
router.get('/log-out', authController.logOut);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.patch(
  '/update-user',
  authController.protect,
  usersController.uploadUserPhoto,
  usersController.resizeUserPhoto,
  usersController.updateMe
);
router.delete('/delete-user', authController.protect, usersController.deleteMe);

router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);

router
  .route('/')
  .get(authController.protect, usersController.getAllUsers)
  .post(usersController.addUser);

router
  .route('/me')
  .get(authController.protect, usersController.getMe, usersController.getUser);
router
  .route('/:id')
  .get(
    authController.protect,
    authController.checkRole('admin'),
    usersController.getUser
  )
  .patch(
    authController.protect,
    authController.checkRole('admin'),
    usersController.updateUser
  )
  .delete(
    authController.protect,
    authController.checkRole('admin'),
    usersController.deleteUser
  );

module.exports = router;
