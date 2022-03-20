var express = require('express');
var router = express.Router();

var index_controller = require('../controllers/indexController');

// GET home page. 
router.get('/', index_controller.index);

// GET shop page
router.get('/shop', index_controller.shop);

// GET about page
router.get('/about', index_controller.about);

// GET contact page
router.get('/contact', index_controller.contact);

module.exports = router;
