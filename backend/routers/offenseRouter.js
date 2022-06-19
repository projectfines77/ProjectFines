const express = require('express')
const router = express.Router()
const { quickPermissionsCheck,authenticateUser } = require('../middleware/authentication');
const {createOffense,getImages} = require('../controllers/offense')

router.post('/createOffense', authenticateUser, quickPermissionsCheck('police'), createOffense) 
router.get('/getImages', authenticateUser, quickPermissionsCheck('police'), getImages)

module.exports = router