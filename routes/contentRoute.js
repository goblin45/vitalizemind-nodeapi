const express = require('express')
const router = express.Router()
const contentController = require('../controllers/contentController')

router.route('/video')
    .post(contentController.getVideo)
    
router.route('/music')
    .post(contentController.getMusic)

router.route('/books')
    .post(contentController.getBooks)

module.exports = router