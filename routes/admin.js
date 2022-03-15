var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/images/uploads' })

var product_controller = require('../controllers/productController');
var category_controller = require('../controllers/categoryController');

// router.get('/inventory', function(req, res, next) {
//   res.render('admin/inventory', { title: 'Inventory' });
// });

// PRODUCTS ROUTES

// GET request for all products
router.get('/inventory', product_controller.inventory);

// GET request for creating a product
router.get('/product/create', product_controller.product_create_get)

// POST request for creating a product
router.post('/product/create', upload.single('product_image'), product_controller.product_create_post);

// GET request for single product
router.get('/product/:id', product_controller.product_detail);


// CATEGORIES ROUTES

// GET request for all categories
router.get('/categories', category_controller.category_list);






module.exports = router;
