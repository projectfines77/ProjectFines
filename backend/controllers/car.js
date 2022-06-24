const Car = require('../models/Car')
const User = require('../models/User')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')

const addCar = async (req,res) => {
    const {userMongoID} = req.user
    req.body.ownerMongoID = userMongoID
    const newCar = await Car.create(req.body)
    res.status(StatusCodes.OK).json(newCar)
}

const getCar = async (req,res) => {
    const {userMongoID} = req.user
    const car = await Car.findOne({ownerMongoID:userMongoID})
    res.status(StatusCodes.OK).json(car)
}

const updateCar = async (req,res) => {
    const car = await Car.findOneAndUpdate({_id:req.params.id}, req.body, {new:true, runValidators:true})
    res.status(StatusCodes.OK).json(car)
}

const deleteCar = async (req,res) => {
    const car = await Car.findOneAndDelete({_id:req.params.id})
    res.status(StatusCodes.OK).json('Deleted car')
}

module.exports = {addCar,getCar, updateCar, deleteCar}