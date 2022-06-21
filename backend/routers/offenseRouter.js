const express = require('express')
const router = express.Router()
const { quickPermissionsCheck,authenticateUser } = require('../middleware/authentication');
const {createOffense,getImages,uploadImage} = require('../controllers/offense')

router.post('/createOffense', authenticateUser, quickPermissionsCheck('police'), createOffense) 
router.post('/uploadImages', authenticateUser, quickPermissionsCheck('police'), uploadImage) 
router.get('/getImages', authenticateUser, quickPermissionsCheck('police'), getImages)

module.exports = router