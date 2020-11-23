const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
  role: {
    type: String,
    required: true,
    enum: ['user', 'guide', 'guide-lead', 'admin'],
    message: 'Invalid role. Should be user,guide,guide-lead or admin'
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
  passwordResetToken: {
    type: String
  },
  resetTokenExpirationDate: {
    type: Date
  },
  photo: {
    type: String
  },
  active: {
    type: Boolean,
    select: false
  }
});

userSchema.pre('save', async function (next) {
  //only runs the function if the password was modified
  if (!this.isModified('password')) {
    return next();
  }
  //enctypting the password

  this.password = await bcrypt.hash(this.password, 12);
  //erasing the password stored on passwordConfirmation field.
  this.passwordConfirmation = undefined;
  //Set date of last password change
  this.passwordChangedAt = Date.now();
  next();
});

//QUERY MIDDLEWARE TO ONLY SHOW ACTIVE USERS ON QUERIES
userSchema.pre('find', async function (next) {
  this.find({ active: true });
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

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  console.log(resetToken);
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetTokenExpirationDate = Date.now() + 10 * 60 * 1000; //10 minutes for this oken to expires
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
