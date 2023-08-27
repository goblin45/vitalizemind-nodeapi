const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')

router.route('/')
    .post(userController.createNewUser)
    .patch(userController.updateUser)

router.route('/login')
    .post(userController.getUser)

router.route('/getUserDetails')
    .post(userController.getUserDetails)

router.route('/setPreferences')
    .post(userController.setPreferences)

router.route('/preferences')
    .post(userController.getPreferences)

router.route('/getAuthKey')
    .post(userController.getAuthKey)

router.route('/compareAuthKey')
    .post(userController.compareAuthKey)

router.route('/addBrowserSearch')
    .post(userController.addBrowserSearch)

router.route('/getLastSearches')
    .post(userController.getLastSearches)

router.route('/setCurrentEmotion')
    .post(userController.setCurrentEmotion)

router.route('/currentEmotion')
    .post(userController.getCurrentEmotion)

router.route('/sendAlert')
    .post(userController.sendAlert)

module.exports = router