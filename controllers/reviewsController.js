const Review = require('./../models/reviewModel');
const catchError = require('./../utils/CatchError');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);
/*catchError(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'Success',
    results: reviews.length,
    reviews
  });
}); */

exports.addReview = catchError(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId; // if the tour id is not specified in the body, look for it in the URL parameters.
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'Review added',
    reviews: newReview
  });
});

exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
