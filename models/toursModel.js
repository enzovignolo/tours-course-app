const mongoose = require('mongoose');
const User = require('./userModel');

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
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      },
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: {
          type: [Number]
        },
        address: {
          type: String
        },
        description: {
          type: String
        },
        day: { type: Number }
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populating with reviews
tourSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//Tour middleware
/* tourSchema.pre('save', async function (next) {
  console.log(this.guides);
  const guidesPromises = this.guides.map(async (id) => {
    return await User.findById(id);
  });
  this.guides = await Promise.all(guidesPromises);
  console.log(this.guides);
  next();
}); */

tourSchema.index({ price: -1 });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
