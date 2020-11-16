const Tour = require('./../models/toursModel');
const APIFeatures = require('./../utils/APIFeatures');
const AppError = require('./../utils/AppError');
const catchError = require('./../utils/CatchError');
//MIDDLEWARE

//CONTROLLERS

exports.getAllTours = catchError(async (req, res, next) => {
  const queryFeature = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .pagination();
  //EXCECUTE THE QUERY
  const tours = await queryFeature.query;
  res.status(200).json({
    status: 'success',
    elements: tours.length,
    tours
  });
});

exports.getTour = catchError(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  console.log(tour);
  if (!tour) {
    return next(new AppError(`Tour with id:${req.params.id} not found`, 404));
  }

  res.status(200).json({
    status: 'Tour succesfully found!',
    data: tour
  });
});

exports.addTour = catchError(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Tour added succesfully',
    data: tour
  });
});

exports.updateTour = catchError(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError(`Tour with id:${req.params.id} not found`, 404));
  }
  res.status(200).json({
    status: 'Tour updated',
    data: tour
  });
});

exports.deletTour = catchError(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`Tour with id:${req.params.id} not found`, 404));
  }
  res.status(204).json({
    status: 'Tour deleted',
    data: tour
  });
});

exports.getTourStats = async (req, res, next) => {
  try {
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
      stats
    });
  } catch (err) {
    console.log;
  }
};
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
    stats
  });
});
