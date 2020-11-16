//jshint esversion:6
const express = require('express');
const morgan = require('morgan');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/AppError');
const tourRouter = require(`${__dirname}/routes/toursRoutes`);
const userRouter = require(`${__dirname}/routes/usersRoutes`);

const app = express();
app.use(express.json()); //THIS IS MIDDLEWARE..

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//ROUTE HANDLERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
