const Car = require('../models/Car')
const User = require('../models/User')
const CustomErrors = require('../errors')
const { StatusCodes } = require('http-status-codes')
const Offense = require('../models/Offense')

const addCar = async (req,res) => {
    const {userMongoID} = req.user
    req.body.ownerMongoID = userMongoID
    const newCar = await Car.create(req.body)
    const addCar = await User.findOne({_id:userMongoID})
    addCar.cars.push(newCar._id)
    await addCar.save()
    res.status(StatusCodes.OK).json(newCar)
}

const getCar = async (req,res) => {
    const car = await Car.findOne({_id:req.params.id})
    res.status(StatusCodes.OK).json(car)
}

const getAllCars = async (req,res) => {
    const {userMongoID} = req.user
    const car = await Car.find({ownerMongoID:userMongoID})
    res.status(StatusCodes.OK).json(car)
}

const updateCar = async (req,res) => {
    const car = await Car.findOneAndUpdate({_id:req.params.id}, req.body, {new:true, runValidators:true})
    res.status(StatusCodes.OK).json(car)
}

const deleteCar = async (req,res) => {
    const car = await Car.findOne({_id:req.params.id})
    if(car.offensesIncurred.length != 0){
        throw new CustomErrors.UnauthorizedError('You have outstanding bills. Pay before delete')
    }
    await car.remove()
    res.status(StatusCodes.OK).json('Deleted car')
}

const getAllOffenses = async (req,res) =>{
    const car = await Car.findOne({_id:req.params.id})
    let offenseArr = []
    for(const ids of car.offensesIncurred){
        const toAdd = await Offense.findOne({_id:ids})
        offenseArr.push(toAdd)
    }
    res.status(StatusCodes.OK).json({offenses: offenseArr})
}

const getSingleOffense = async (req,res) =>{
    const singleOffense = await Offense.findOne({_id:req.params.id})
    res.status(StatusCodes.OK).json({offenses: singleOffense})
}

module.exports = {addCar,getAllCars, updateCar, deleteCar,getCar,getAllOffenses,getSingleOffense}