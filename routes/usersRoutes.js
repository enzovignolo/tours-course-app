const express = require('express');
const { route } = require('../app');
const usersController = require(`../controllers/usersController`);
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/sign-up', authController.signUp);
router.post('/logIn', authController.logIn);

router.post('/reset-password', authController.resetPassword);

router
  .route('/')
  .get(usersController.getAllUsers)
  .post(usersController.addUser);

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
