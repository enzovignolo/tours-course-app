//jshint esversion:6
const express = require('express');
const morgan = require('morgan');
const tourRouter = require(`${__dirname}/routes/toursRoutes`);
const userRouter = require(`${__dirname}/routes/usersRoutes`);
const reviewsRouter = require(`${__dirname}/routes/reviewsRoutes`);
const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();
app.use(
  express.json({
    limit: '10kb'
  })
); //THIS IS MIDDLEWARE.. the option in the body parser, limits the payload sent in the request

app.use(mongoSanitize());
app.use(xss());

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//LIMIT CONNECTIONS FROM IP
const limiter = rateLimit({
  max: 100, //amount of requests
  windowsMs: 60 * 60 * 1000, //time in milliseconds
  message: 'Reques limit exceeded, please try again later'
});

app.use('/api', limiter);
//ROUTE HANDLERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewsRouter);

// ERROR HANDLING ON ANY ROUTE THAT DOES NOT MATCH ABOVE ONES

app.all('*', (req, res, next) => {
  const missRoute = req.originalUrl;
  /* const error = new Error();
  error.status = 'Fail';
  error.statusCode = 404;
  error.message = `${missRoute} not defined on the server`; */
  next(new AppError(`${missRoute} not defined on the server`, 400));
});

app.use(errorController);

module.exports = app;
