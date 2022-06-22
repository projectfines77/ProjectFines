const { login, register, loginHistory, showAllStaff, showMe, showOneStaff, updateStaffNotPassword, updateStaffPassword, logout, showMyTicketingHistory, showStaffTicketingHistory } = require('../controllers/administrative')
const express = require('express')
const router = express.Router()
const { quickPermissionsCheck, authenticatePolice } = require('../middleware/authenticationPoliceOnly');

router.post('/register', register)
router.post('/login', login)
router.get('/loginHistory', authenticatePolice, loginHistory)
router.get('/showAllStaff', authenticatePolice, quickPermissionsCheck('admin'), showAllStaff)
router.get('/showMe', authenticatePolice, showMe)
router.get('/showOneStaff/:id', authenticatePolice, showOneStaff)
router.patch('/updateStaffNotPassword/:id', authenticatePolice, quickPermissionsCheck('admin'), updateStaffNotPassword)
router.patch('/updateStaffPassword', authenticatePolice, updateStaffPassword)
router.delete('/logout', authenticatePolice, logout)
router.get('/showMyTicketingHistory', authenticatePolice, showMyTicketingHistory)
router.get('/showStaffTicketingHistory/:id', authenticatePolice, quickPermissionsCheck('admin'), showStaffTicketingHistory)

module.exports = router;