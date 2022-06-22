const {login,register,loginHistory,showAllStaff,showMe,showOneStaff,updateStaffNotPassword, updateStaffPassword, logout,showMyTicketingHistory,showStaffTicketingHistory} = require('../controllers/administrative')
const express = require('express')
const router = express.Router()
const { quickPermissionsCheck,authenticateUser } = require('../middleware/authentication');

router.post('/register', register)
router.post('/login', login)
router.get('/loginHistory',authenticateUser, loginHistory)
router.get('/showAllStaff',authenticateUser,quickPermissionsCheck('admin'), showAllStaff)
router.get('/showMe',authenticateUser, showMe )
router.get('/showOneStaff/:id', authenticateUser, showOneStaff)
router.patch('/updateStaffNotPassword/:id', authenticateUser,quickPermissionsCheck('admin'), updateStaffNotPassword)
router.patch('/updateStaffPassword', authenticateUser, updateStaffPassword)
router.delete('/logout', authenticateUser, logout)
router.get('/showMyTicketingHistory',authenticateUser, showMyTicketingHistory )
router.get('/showStaffTicketingHistory/:id',authenticateUser,quickPermissionsCheck('admin'), showStaffTicketingHistory )

module.exports = router;