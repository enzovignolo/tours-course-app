const express = require('express');
const toursController = require(`${__dirname}/../controllers/toursController`);
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewsRoutes');

//ROUTES;
const router = express.Router();

// NESTED ROUTE FOR REVIEWS OF AN SPECIFIC TOUR
router.use('/:tourId/reviews', reviewRouter);

/* router.param('id', toursController.checkId); */

router.route('/tour-stats').get(toursController.getTourStats);
router
  .route('/tour-stats/monthly-stats/:year')
  .get(toursController.getMonthlyStats);
router
  .route('/')
  .get(authController.protect, toursController.getAllTours)
  .post(authController.protect, toursController.addTour);
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
