const express = require('express')
const router = express.Router()
const {
    register,
    login,
    showAllStaff,
    showOneStaff,
    updateStaffNotPassword,
    showStaffTicketingHistory,
    logout
} = require('../controllers/admin')
const { 
    authenticateAdmin,
    quickPermissionsCheckAdmin,
 } = require('../middleware/authenticationAdminOnly');


 router.post('/register', register)
 router.post('/login', login)
 router.get('/showAllStaff' , authenticateAdmin, quickPermissionsCheckAdmin('admin'), showAllStaff )
 router.get('/showOneStaff/:id' , authenticateAdmin, quickPermissionsCheckAdmin('admin'), showOneStaff )
 router.get('/showStaffTicketingHistory/:id' , authenticateAdmin, quickPermissionsCheckAdmin('admin'), showStaffTicketingHistory )
 router.get('/updateStaffNotPassword/:id', authenticateAdmin,quickPermissionsCheckAdmin('admin'),updateStaffNotPassword)
 router.delete('/logout', authenticateAdmin, logout)
 module.exports = router;