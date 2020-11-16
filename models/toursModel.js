const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Must have a name!'],
      unique: true,
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'Must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Must have a Max Group Size']
    },
    difficulty: {
      type: String,
      required: [true, 'Must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Must have a price']
    },
    priceDiscount: {
      type: Number
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
