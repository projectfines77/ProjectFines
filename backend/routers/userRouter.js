const express = require('express')
const router = express.Router()
const {register,login,updateAccount,deleteAccount,logout, showMe} = require('../controllers/userBasic.js')
const { quickPermissionsCheckUser, authenticateUser } = require('../middleware/authenticationUserOnly');

router.post('/register', register)
router.post('/login', login)
router.get('/showMe',authenticateUser, showMe)
router.patch('/updateAccount', authenticateUser, updateAccount)
router.delete('/deleteAccount', authenticateUser, deleteAccount)
router.delete('/logout', authenticateUser, logout)

module.exports = router;

