const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name...']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      validator: function () {
        return this.password === this.passwordConfirmation;
      },
      message: 'Password does not match!'
    }
  },
  passwordChangedAt: {
    type: Date
  },
  photo: {
    type: String
  }
});

userSchema.pre('save', async function (next) {
  //only runs the function if the password was modified
  if (this.isModified('password')) {
    return next();
  }
  //enctypting the password
  this.password = await bcrypt.hash(this.password, 12);
  //erasing the password stored on passwordConfirmation field.
  this.passwordConfirmation = undefined;
  next();
});

userSchema.methods.comparePassword = async (
  candidatePassword,
  userPassword
) => {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChanged = async function (JWTiat) {
  console.log('hello');
  if (this.passwordChangedAt) {
    const lastChangeTime =
      parseInt(this.passwordChangedAt.getTime(), 10) / 1000;
    if (lastChangeTime >= JWTiat) {
      return true;
    }
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
