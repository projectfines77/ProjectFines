const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');

//use card-validator when creating payment profiles
const paymentProfile = mongoose.Schema({
  cardNumber: {
    type: String,
    required: [true, 'Please provide Card number']
  },
  ccv: {
    type: String,
    required: [true, 'Please provide ccv']
  },
  expiryMonth: {
    type: String,
    required: [true, 'Please provide expiry month']
  },
  expiryYear: {
    type: String,
    required: [true, 'Please provide expiry year ']
  },
  nameOnCard: {
    type: String,
    required: [true, 'Please provide name on card']
  },
  zipCode: {
    type: String,
    required: [true, 'Please provide zip code']
  }
})

paymentProfile.index({cardNumber:1, ccv:1, expiryMonth:1, expiryYear:1, nameOnCard:1},{ unique: true })

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  cars: {
    type: [mongoose.Types.ObjectId],
    ref: 'Car',
  },
  paymentProfile: {
    type: [paymentProfile]
  },
  role: {
    type: String,
    default: 'user'
  },
  // paymentHistory:{
  //   type:[]
  // }
}, { timestamps: true })

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

//Seems to work. More testing required
UserSchema.pre('remove', async function (next) {
  await this.model('Car').deleteMany({ ownerMongoID: this._id });
});

module.exports = mongoose.model('User', UserSchema);