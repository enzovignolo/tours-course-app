//jshint esversion:6

///// DEPENDENCIES //////
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const tourRouter = require(path.join(__dirname, 'routes/toursRoutes'));
const userRouter = require(path.join(__dirname, 'routes/usersRoutes'));
const reviewsRouter = require(path.join(__dirname, 'routes/reviewsRoutes'));
const viewsRouter = require(path.join(__dirname, 'routes/viewsRoutes'));
const bookingsRouter = require(path.join(__dirname, 'routes/bookingsRoutes'));

const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const xss = require('xss-clean');
const compression = require('compression');

////////////////////////////

const app = express();
app.use(
  express.json({
    //THIS IS MIDDLEWARE.. the option in the body parser, limits the payload sent in the request
    limit: '10kb'
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb'
  })
);

app.use(cookieParser());

//Compreess responses

app.use(compression());

// MIDDLEWARE TO SANITIZE AND PROTECT FROM DATA SENT FROM USER
app.use(mongoSanitize());
app.use(xss());

//ENABLE CORS
app.use(cors());
// SECURITY HEADERS
//app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:']
    }
  })
);

//  VIEW
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//
//SOME DEBUGGING FEATURE
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

app.use('/', viewsRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/bookings', bookingsRouter);

// ERROR HANDLING ON ANY ROUTE THAT DOES NOT MATCH ABOVE ONES

app.all('*', (req, res, next) => {
  const missRoute = req.originalUrl;
  next(new AppError(`${missRoute} not defined on the server`, 400));
});

app.use(errorController);

module.exports = app;
