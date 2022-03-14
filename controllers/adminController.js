var async = require('async');
var Category = require('../models/category');
var Product = require('../models/product');
const { body, validationResult } = require('express-validator');
var fs = require('fs');



const inventory = (req, res, next) => {

  Product
  .find()
  .populate({path: 'category', select: 'name'}) // populate only with name
  .exec(function(err, products) {
    if (err) { return next(err); };
    // successful so render
    res.render('admin/inventory', 
      {
        title: 'Inventory',
        products:products
      });
  });

};

const product_create_get = (req, res, next) => {

  Category
    .find({}, 'name')
    .exec(function (err, list_categories) {
      if (err) {return next(err);}
      // successful so render
      res.render('admin/product_form', 
        {
          title: 'Create product',
          categories: list_categories,
          err: err
        });  
    });

};

const product_create_post = [

  // validate and sanitize fields
  body('product_name')
    .not().isEmpty()
    .withMessage('Product name must not be empty.')
    .isLength({min: 3})
    .withMessage('Product name must be at least 3 chars long.')
    .isLength({max: 70})
    .withMessage('Product name must be at least 70 chars long.')
    .trim()
    .isLength({ min: 3, max: 70 })
    .escape(),
  body('product_description', 'Product description must not be empty')
    .trim()
    .escape(),
  body('product_category', 'Product category must not be empty')
    .trim()
    .escape(),
  body('product_price', 'Product price must not be empty')
    .trim()
    .escape(),
  body('product_stock', 'Product stock must not be empty')
    .trim()
    .escape(),

  // body('product_image', 'Product image must not be empty')
  //   .trim()
  //   .escape(),

  // process request after validation and sanitization
  (req, res, next) => {

    // extract the validation errors from request
    const errors = validationResult(req);
    
    // create a product object with escaped and trimmed data
    var product = new Product(
      {
        name: req.body.product_name,
        description: req.body.product_description,
        category: req.body.product_category,
        image_id: req.file.filename,
        price: (()=> {
          var e = req.body.product_price
          var priceArray = e.split("")
          var arrLength = priceArray.length
          var commaIndex = e.indexOf('.')
          var decimalIndex = commaIndex + 2

          if (!priceArray[decimalIndex]) {
            // if the price does not have the decimal number
            return e + '0'
          }
          if (!e.includes('.')) {
            // if the price does not have cents
            return e + '.00'
          }

          // if everything is all right return the price
          return e
        })(),
        stock: req.body.product_stock
      }
      );
      
      if (!errors.isEmpty()) {
        // there are errors. render form again with sanitized values/error messages

        Category //we find the categories for the dropdown selection
        .find({}, 'name')
        .exec(function (err, list_categories) {
          if (err) {return next(err);}

          res.render('admin/product_form', 
          {
            title: 'Create product',
            categories: list_categories,
            product: product,
            err: errors.array(),
          });

          //delete the image that was saved in the host storage
          fs.unlink('public/images/uploads/' + product.image_id, function(err) {
            if (err) { return next(err); };
          });

        });
        return;
      }
      else {
        // data from form is valid, save product
        product.save(function(err) {
          if (err) { return next(err); }
          // successful, redirect to inventory
          res.redirect('/admin/inventory')
        });
      };
    },
  ];
  
  
  module.exports = {
    inventory,
    product_create_get,
    product_create_post
  }
  