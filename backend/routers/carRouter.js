const {addCar,getCar, updateCar, deleteCar} = require('../controllers/car')
const express = require('express')
const router = express.Router()
const { quickPermissionsCheckUser, authenticateUser } = require('../middleware/authenticationUserOnly');

router.post('/addCar', authenticateUser, addCar)
router.get('/getCar/:id', authenticateUser, getCar)
router.patch('/updateCar/:id', authenticateUser, updateCar)
router.delete('/deleteCar/:id', authenticateUser, deleteCar)

module.exports = router