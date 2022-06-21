const Offense = require('../models/Offense')
const Car = require('../models/Car')
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
    const {offenseType, carPlate} = req.body
    res.status(StatusCodes.CREATED).json('createOffense')
}

module.exports = {getImages,createOffense,uploadImage}