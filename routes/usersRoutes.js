const express = require('express');
const { route } = require('../app');
const usersController = require(`../controllers/usersController`);
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/sign-up', authController.signUp);
router.post('/logIn', authController.logIn);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.patch('/update-user', authController.protect, usersController.updateMe);
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
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(
    authController.protect,
    authController.checkRole('admin'),
    usersController.deleteUser
  );

module.exports = router;
