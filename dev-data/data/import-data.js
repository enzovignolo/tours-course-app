const dotEnv = require('dotenv');
dotEnv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Tour = require('../../models/toursModel');
const fs = require('fs');

const db = process.env.DATABASE_REMOTE;

mongoose
  .connect(
    //for remote database
    db.replace('<PASS_DB>', process.env.PASS_DB_REMOTE),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log('Succesfully connected!'));

const data = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
console.log(data);
const importData = async () => {
  try {
    await Tour.create(data);
    console.log('Data improted!');
  } catch (error) {
    console.log(error);
  }

  process.exit();
};
const deleteData = async () => {
  /* THIS DELETE THE WHOLE COLLECTION OF DATA */
  try {
    await Tour.deleteMany();
    console.log('DATA DELETED !');
  } catch (error) {
    console.log('There was an error');
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log(
    'Use --import to import data or --delete to delete all data from collections.'
  );
  process.exit();
}
