const Tour = require('./../models/toursModel');
const APIFeatures = require('./../utils/APIFeatures');
const AppError = require('./../utils/AppError');
const catchError = require('./../utils/CatchError');
const factory = require('./handlerFactory.js');
const multer = require('multer');
const sharp = require('sharp');

//MIDDLEWARE

//photo uploading
const multerFilter = (req, file, cb) => {
  //CHECK IF THE FILE IS AN IMG
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, Please upload only images.', 400), false); //PASS AN ERROR
  }
};

const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchError(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  //1)Cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2) Images
  req.body.images = []; //HERE WE WILL SEND THE IMAGES FILENAMES
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      req.body.images.push(fileName);
    })
  );
  next();
});

//CONTROLLERS

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

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

exports.getToursNear = catchError(async (req, res, next) => {
  const { distance, longlat, unit } = req.params;
  const [long, lat] = longlat.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tour = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[long * 1, lat * 1], radius]
      }
    }
  });
  res.status(200).json({
    results: tour.length,
    tour
  });
});

exports.getDistance = catchError(async (req, res, next) => {
  const { longlat, unit } = req.params;
  const [long, lat] = longlat.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [long * 1, lat * 1]
        },
        distanceField: 'distances',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        name: 1,
        ratingsAverage: 1,
        difficulty: 1,
        startLocation: 1,
        distances: 1
      }
    }
  ]);
  res.status(200).json({
    distances
  });
});
/* exports.getTourDetails = catchError(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews'
  });
  res.status(200).render('tour', {
    tour
  });
});
 */
