////////// DEPENDENCIES ////////////
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');
////////////

const port = process.env.PORT;
const DB = process.env.DATABASE_REMOTE.replace(
  '<PASS_DB>',
  process.env.PASS_DB_REMOTE
);

// CREATING CONNECTION TO THE DB

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to the DB! '));

// OPEN SERVER
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(' UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => {
    console.log('Process terminated');
  });
});
