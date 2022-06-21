const express = require('express')
const router = express.Router()
const { quickPermissionsCheck,authenticateUser } = require('../middleware/authentication');
const {createOffense,getImages,uploadImage,updateOffense} = require('../controllers/offense')

router.post('/createOffense', authenticateUser, quickPermissionsCheck('police'), createOffense) 
router.post('/uploadImages', authenticateUser, quickPermissionsCheck('police'), uploadImage) 
router.get('/getImages', authenticateUser, quickPermissionsCheck('police'), getImages)
router.patch('/updateOffense/:id', authenticateUser, quickPermissionsCheck('admin'), updateOffense)

module.exports = router