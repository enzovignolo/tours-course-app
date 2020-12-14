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

//THIS ENDPOINT GETS ALL TOURS IN A CERTAIN RADIUS FROM A CENTER POINT DEFINED
router
  .route('/tours-whithin/:distance/center/:longlat/units/:unit')
  .get(toursController.getToursNear);

// THIS ENDPOINT CALCULATE DISTANCE TO ALL TOURS AVAILABLES
router.route('/distance/:longlat/units/:unit').get(toursController.getDistance);

router.route('/tour-stats').get(toursController.getTourStats);
router
  .route('/tour-stats/monthly-stats/:year')
  .get(toursController.getMonthlyStats);
router
  .route('/:id')
  .get(toursController.getTour)
  .patch(
    authController.protect,
    authController.checkRole('admin', 'lead-guide'),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.updateTour
  )
  .delete(
    authController.protect,
    authController.checkRole('admin', 'lead-guide'),

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
