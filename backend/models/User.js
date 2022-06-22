const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');

//use card-validator when creating payment profiles
const paymentProfile = new mongoose.Schema({
    cardNumber:{
        type:String,
        required:[true,'Please provide Card number']
    },
    ccv:{
        type:String,
        required:[true,'Please provide ccv']
    },
    expiryMonth:{
        type:String,
        required:[true,'Please provide expiry month']
    },
    expiryDay:{
        type:String,
        required:[true,'Please provide expiry day ']
    },
    nameOnCard:{
        type:String,
        required:[true,'Please provide name on card']
    },
    zipCode:{
        type:String,
        required:[true,'Please provide zip code']
    }
})

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
      cars:{
        type: [mongoose.Types.ObjectId],
        ref: 'Car',       
      },
      paymentProfile:{
        type: [paymentProfile]
      },
}, {timestamps:true})

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  
UserSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password);
    return isMatch;
};
  
module.exports = mongoose.model('User', UserSchema);