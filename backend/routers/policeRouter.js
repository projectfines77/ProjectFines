const {login,register,loginHistory,showAllStaff,showMe} = require('../controllers/administrative')
const express = require('express')
const router = express.Router()
const { quickPermissionsCheck,authenticateUser } = require('../middleware/authentication');

router.post('/register', register)
router.post('/login', login)
router.get('/loginHistory',authenticateUser, loginHistory)
router.get('/showAllStaff',authenticateUser,quickPermissionsCheck('admin'), showAllStaff)
router.get('/showMe',authenticateUser, showMe )

module.exports = router;