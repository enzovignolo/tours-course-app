const mongoose = require('mongoose');
const Tour = require('./toursModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: { type: Date, default: Date.now },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Must have a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Must have an author']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
reviewSchema.virtual('reviews');
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo '
  });
  /*  this.populate({
    path: 'tour',
    select: 'name'
  }); */
  next();
});

reviewSchema.statics.calculateAvg = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        nRatings: { $sum: 1 }
      },
      $round: ['$avgRating', 1]
    }
  ]);
  const tour = await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRatings
  });
};
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne({}); // THIS OBTAINS THE DOCUMENT BY EXCECUTING THE QUERY SO IT CAN BE STORED AND WORKED ON LATER ON A POST MIDDLEWARE

  next();
});
reviewSchema.post(/^findOneAnd/, function () {
  console.log(this.r);
  this.r.constructor.calculateAvg(this.r.tour); // HERE WE CAN ACCESS THE DOCUMENT TO PASS IT TO THE STATIC METHOD.
});

reviewSchema.post('save', function () {
  console.log(this.constructor);
  this.constructor.calculateAvg(this.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
