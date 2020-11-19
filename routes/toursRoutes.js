const express = require('express');
const { route } = require('../app');
const toursController = require(`${__dirname}/../controllers/toursController`);
const authController = require('./../controllers/authController');
//ROUTES;
const router = express.Router();

/* router.param('id', toursController.checkId); */

router.route('/tour-stats').get(toursController.getTourStats);
router
  .route('/tour-stats/monthly-stats/:year')
  .get(toursController.getMonthlyStats);
router
  .route('/')
  .get(authController.protect, toursController.getAllTours)
  .post(toursController.addTour);
router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(
    authController.protect,
    authController.checkRole('admin'),
    toursController.deletTour
  );

module.exports = router;
