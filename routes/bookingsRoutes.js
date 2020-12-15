///////// DEPENDENCIES ////////
const express = require('express');
const bookingsController = require('../controllers/bookingsController');
const authController = require('../controllers/authController');
////////////////////////////

const router = express.Router({}); // The merge params options allows us to have access to parameters from other routers
router.route('/').get(bookingsController.getBooking);
router
  .route('/checkout-session/:tourID')
  .get(authController.protect, bookingsController.getCheckOutSession);
module.exports = router;
