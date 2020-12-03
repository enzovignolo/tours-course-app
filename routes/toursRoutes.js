///////// DEPENDENCIES ////////
const express = require('express');
const toursController = require(`${__dirname}/../controllers/toursController`);
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewsRoutes');
////////////////

//ROUTES
const router = express.Router();

// NESTED ROUTE FOR REVIEWS OF AN SPECIFIC TOUR
router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(toursController.getTourStats);
router
  .route('/tour-stats/monthly-stats/:year')
  .get(toursController.getMonthlyStats);
router
  .route('/:id')
  .get(toursController.getTour)
  .patch(
    authController.protect,
    authController.checkRole('admin'),
    toursController.updateTour
  )
  .delete(
    authController.protect,
    authController.checkRole('admin'),
    toursController.deletTour
  );
router
  .route('/')
  .get(toursController.getAllTours)
  .post(
    authController.protect,
    authController.checkRole('admin'),
    toursController.addTour
  );

module.exports = router;
