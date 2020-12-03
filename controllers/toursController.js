const Tour = require('./../models/toursModel');
const APIFeatures = require('./../utils/APIFeatures');
const AppError = require('./../utils/AppError');
const catchError = require('./../utils/CatchError');
const factory = require('./handlerFactory.js');
//MIDDLEWARE

//CONTROLLERS

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'review' });

exports.updateTour = factory.updateOne(Tour);

exports.deletTour = factory.deleteOne(Tour);

exports.addTour = catchError(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Tour added succesfully',
    data: tour
  });
});

//CONTROLLER TO GET STATTISTICS FROM TOURS, GROUPED BY DIFFICULTY

exports.getTourStats = catchError(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        avgRaiting: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' }
      }
    }
  ]);
  res.status(200).json({
    status: 'Success!',
    results: stats.length,
    stats
  });
});

//CONTROLLER TO GET STATTISTICS FROM TOURS, GROUPED BY MONTH
exports.getMonthlyStats = catchError(async (req, res, next) => {
  const year = req.params.year * 1;
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: { $gte: new Date(`${year}-01-31`) }
      }
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        avgRaiting: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);
  res.status(200).json({
    status: 'Success!',
    results: stats.length,
    stats
  });
});
