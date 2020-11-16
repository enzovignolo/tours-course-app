const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT;
const DB = process.env.DATABASE_REMOTE.replace(
  '<PASS_DB>',
  process.env.PASS_DB_REMOTE
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('success!'));

// CREATING SCHEMAS
console.log(process.env.NODE_ENV);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
