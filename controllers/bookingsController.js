const Tour = require('../models/toursModel');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('./../utils/AppError');
const catchError = require('../utils/CatchError');
const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const factory = require('./handlerFactory.js');
const Booking = require('../models/bookingModel');

exports.getBooking = (req, res, next) => {
  res.status(200).json({
    data: 'NOT IMPLEMENTED YET'
  });
};

exports.getCheckOutSession = catchError(async (req, res, next) => {
  //Get tour
  const tour = await Tour.findById(req.params.tourID);

  //Create checkoutsession
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: `${tour.summary}`,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });
  //Create session as response
  res.status(200).json({
    data: 'Success',
    session
  });
});

exports.createBookingCheckOut = catchError(async (req, res, next) => {
  // Extract data for create the booking
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  //Create a booking
  await Booking.create({ tour, user, price });

  //Redirect to the overview page
  res.redirect(req.originalUrl.split('?')[0]);
});
