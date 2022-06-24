const {addCar,getAllCars, updateCar, deleteCar,getCar,getAllOffenses,getSingleOffense} = require('../controllers/car')
const express = require('express')
const router = express.Router()
const { quickPermissionsCheckUser, authenticateUser } = require('../middleware/authenticationUserOnly');

router.post('/addCar', authenticateUser, addCar)
router.get('/getSingleCar/:id', authenticateUser, getCar)
router.get('/getCars', authenticateUser, getAllCars)
router.patch('/updateCar/:id', authenticateUser, updateCar)
router.delete('/deleteCar/:id', authenticateUser, deleteCar)
router.get('/getOffenses/:id', authenticateUser, getAllOffenses)
router.get('/getSingleOffense/:id',authenticateUser,getSingleOffense)

module.exports = router