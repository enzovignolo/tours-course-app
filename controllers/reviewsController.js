const Review = require('./../models/reviewModel');
const catchError = require('./../utils/CatchError');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

exports.addReview = catchError(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId; // if the tour id is not specified in the body, look for it in the URL parameters.
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'Review added',
    reviews: newReview
  });
});
