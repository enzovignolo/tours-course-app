const Tour = require('./../models/toursModel');
const APIFeatures = require('./../utils/APIFeatures');
const AppError = require('./../utils/AppError');
const catchError = require('./../utils/CatchError');
const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const factory = require('./handlerFactory.js');

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
    success_url: `${req.protocol}://${req.get('hos')}/`,
    cancel_url: `${req.protocol}://${req.get('hos')}/tour/${tour.slug}`,
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
