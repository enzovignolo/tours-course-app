const express = require('express');
const reviewsController = require('./../controllers/reviewsController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true }); // The merge params options allows us to have access to parameters from other routers
router
  .route('/')
  .get(authController.protect, reviewsController.getAllReviews)
  .post(
    authController.protect,
    authController.checkRole('user'),
    reviewsController.addReview
  );

router
  .route('/:id')
  .get(reviewsController.getReview)
  .patch(reviewsController.updateReview)
  .delete(reviewsController.deleteReview);
module.exports = router;
