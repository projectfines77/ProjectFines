const Offense = require('../models/Offense')
const Car = require('../models/Car')
const Police = require('../models/Police')
const CustomErrors = require('../errors')
const {StatusCodes} = require('http-status-codes')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const getImages = async (req,res) => {
    const {carPlate} = req.body
    const car = await Car.findOne({carPlate:carPlate})
    res.status(StatusCodes.OK).json(car.imagesOfThisCar)
}

const uploadImage = async (req, res) => {
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: 'offenses',
      }
    );
    console.log(req.files.image.tempFilePath);
    fs.unlinkSync(req.files.image.tempFilePath);
    return res.status(StatusCodes.OK).json( result.secure_url );
};

const createOffense = async (req,res) => {
    const {offenseType, carPlate, imageEvidence, notes} = req.body
    console.log(req.police);
    const police = await Police.findOne({_id:req.police.policeMongoID})
    const offense = await Offense.create({
      policeThatIssuedOffenseID: req.police.policeMongoID,
      imageEvidence: imageEvidence,
      offenseType: offenseType,
      policeThatIssuedOffenseBadgenumber: police.badgenumber,
      carPlate: carPlate,
      resolvedOrNot: false,
      resolvedDateTime: null,
      notes: notes
    })
    res.status(StatusCodes.CREATED).json({receipt: offense})
}

module.exports = {getImages,createOffense,uploadImage}