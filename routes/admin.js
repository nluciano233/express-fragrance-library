var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/images/uploads' })

var admin_controller = require('../controllers/adminController');

// router.get('/inventory', function(req, res, next) {
//   res.render('admin/inventory', { title: 'Inventory' });
// });

router.get('/inventory', admin_controller.inventory);

// get request for creating a product
router.get('/product/create', admin_controller.product_create_get)

// post request for creating a product
router.post('/product/create', upload.single('product_image'), admin_controller.product_create_post);

module.exports = router;
