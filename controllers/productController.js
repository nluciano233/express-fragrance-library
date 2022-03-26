var async = require('async');
var Category = require('../models/category');
var Product = require('../models/product');
const { body, validationResult } = require('express-validator');
var fs = require('fs');
var cloudinary = require('cloudinary');

// helper functions
function priceFormatter(price) {
  var e = price
  var priceArray = e.split("")
  var arrLength = priceArray.length
  var commaIndex = e.indexOf('.')
  var decimalIndex = commaIndex + 2

  if (!e.includes('.')) {
    // if the price does not have cents
    return e + '.00'
  }
  if (!priceArray[decimalIndex]) {
    // if the price does not have the decimal number
    return e + '0'
  }

  // if everything is all right return the price
  return e
};

// checks if the image has been submitted when the admin updates the product. If it hasnt, the form will submit the image_id that already exists in the database. If the admin has updated a new image, the new image_id will be used.
function checkImgSubmit(img, req) {
  // req is also passed inside the function as second parameter otherwise it can't use request values
  if (!img) {
    return req.body.previous_product_image
  }
  return req.file.filename
};

// get product image name from cloudinary given the url
function getCldProductImgName(req, imgUrl) { // the req is necessary so you can access the request inside the function. The request is accessed by passing it inside imgUrl
  url = imgUrl;
  var lastIndexOfComma = url.lastIndexOf('.');
  var lastIndexOfSlash = url.lastIndexOf('/');
  var previousImageName = url.substring(lastIndexOfSlash + 1, lastIndexOfComma);

  return previousImageName;
}

// filter products that have a category that got deleted, add "error" as category name
function filterDeletedCategory(e) {

  if (Array.isArray(e)) {
    e.forEach((prod) => {
      console.log('single prod', prod)
      if (prod.category == null) {
        prod.category = {}
        prod.category.name = "Error: category does not exist."
      }
    });
  }
  else {
    if (e.category == null) {
      e.category = {}
      e.category.name = "Error: category does not exist."
    };
  };

};



const inventory = (req, res, next) => {

  Product
  .find()
  .populate({path: 'category', select: 'name'}) // populate only with name
  .exec(function(err, products) {
    if (err) { return next(err); };
    // successful so render

    filterDeletedCategory(products);

    res.render('admin/inventory', 
      {
        products:products,
        totalProducts: products.length
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
    .not().isEmpty()
    .trim()
    .escape(),
  body('product_category', 'Product category must not be empty')
    .not().isEmpty()
    .trim()
    .escape(),
  body('product_price', 'Product price must not be empty')
    .not().isEmpty()
    .trim()
    .escape(),
  body('product_stock', 'Product stock must not be empty')
    .not().isEmpty()
    .trim()
    .escape(),

  // body('product_image', 'Product image must not be empty')
  //   .trim()
  //   .escape(),

  // process request after validation and sanitization
  (req, res, next) => {

    //execute code only if there is no anti_spam field in the req.body
    if (!req.body.anti_spam) {
      // extract the validation errors from request
      const errors = validationResult(req);
      
      // create a product object with escaped and trimmed data
      var product = new Product(
        {
          name: req.body.product_name,
          description: req.body.product_description,
          category: req.body.product_category,
          image_id: req.file.filename,
          price: priceFormatter(req.body.product_price),
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
              categories: list_categories,
              product: product,
              err: errors.array(),
            });

            //delete the image that was saved in the local storage
            fs.unlink('public/images/uploads/' + product.image_id, function(err) {
              if (err) { return next(err); };
            });

          });
          return;
        }
        else {

          // Form data is valid, upload image to cloudinary
          cloudinary.uploader.upload(`public/images/uploads/${product.image_id}`, function(results) {
            if (results.error) { 
              // there are errors. image did not successfully got uplaoded.
              console.log(results)
              Category //we find the categories for the dropdown selection
              .find({}, 'name')
              .exec(function (err, list_categories) {
                if (err) {return next(err);}
    
                res.render('admin/product_form', 
                {
                  categories: list_categories,
                  product: product,
                  err: [{msg: 'Something went wrong. Retry later.'}],
                });
    
                //delete the image that was saved in the local storage
                fs.unlink('public/images/uploads/' + product.image_id, function(err) {
                  if (err) { return next(err); };
                });
    
              });
              return;
            };

            // image got successfully uploaded to cloudinary.
            console.log('Successfully uploaded to cloudinary: ', results)

            // remove image from local storage since it has been successfully uploaded to the cloduinary host
            fs.unlink('public/images/uploads/' + product.image_id, function(err) {
              if (err) { return next(err); };
            });

            // add cloudinary image_url to the mongodb database
            product.image_url = results.url

            // save the product to the database
            product.save(function(err) {
              if (err) { return next(err); }
              // successful, redirect to inventory
              res.redirect('/admin/inventory')
            });

          });
        };
      };
    },
  ];

  const product_detail = (req, res, next) => {

      async.parallel({
        product: function(callback) {
          Product.findById(req.params.id)
            .populate({path: 'category', select: 'name'}) // populate only with name
            .exec(callback)
        },
        categories: function(callback) {
          Category.find({}, 'name')
          .exec(callback)
        },
      }, function(err, results) {
        if (err) { return next(err); };
        // successful so render
        results.product.price = priceFormatter(results.product.price)

        filterDeletedCategory(results.product);

        res.render('admin/product_detail',
          {
            title: 'Edit product: ' + results.product.name,
            product: results.product,
            categories: results.categories
          });
      });

  };

  const product_update_post = [

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
      .not().isEmpty()
      .trim()
      .escape(),
    body('product_category', 'Product category must not be empty')
      .not().isEmpty()
      .trim()
      .escape(),
    body('product_price', 'Product price must not be empty')
      .not().isEmpty()
      .trim()
      .escape(),
    body('product_stock', 'Product stock must not be empty')
      .not().isEmpty()
      .trim()
      .escape(),
    

    // process request after validation and sanitization
    (req, res, next) => {



      // execute code only if there is no anti_spam field in the req.body
      if (!req.body.anti_spam) {

        // extract the validation errors from request
        const errors = validationResult(req);

        // create a product object with escaped and trimmed data
        var product = new Product(
          {
            name: req.body.product_name,
            description: req.body.product_description,
            category: req.body.product_category,
            image_id: checkImgSubmit(req.file, req),
            price: priceFormatter(req.body.product_price),
            stock: req.body.product_stock,
            image_url: req.body.product_image_url,
            _id: req.params.id, // required or a new ID will be assigned
          }
        );

        if (!errors.isEmpty()) {
          // there are errors, render form again with sanitized values and error messages

          Category.find({}, 'name')
            .exec(function (err, results) {
              if (err) { return next(err); }
              // successful so render
              res.render('admin/product_detail',
                {
                  title: 'Edit product: ' + product.name,
                  product: product,
                  categories: results,
                  err: errors.array()
                }
              );

              // there were errors so delete the image if the user submitted an new one
              if (req.file) {
                fs.unlink('public/images/uploads/' + product.image_id, function(err) {
                  if (err) { return next(err); };
                });
              };

            });
            return
          };

          // data from form is valid, proceed
          
          // if there is a new image submitted, delete the old one and upload the new one to cloudinary
          if (req.file) {
            
            // upload new image to cloudinary
            cloudinary.uploader.upload(`public/images/uploads/${product.image_id}`, function(results) {

              if (results.error) {
                // there are errors. image did not successfully get uploaded.
                console.log(results)
                Category.find({}, 'name')
                .exec(function(err, result) {
                  if (err) { return next(err); };
                  // successful so render
                  res.render('admin/product_detail',
                    {
                      title: 'Edit product: ' + product.name,
                      product: product,
                      categories: result,
                      err: [{msg: 'Something went wrong. Retry later.'}],
                    }
                  )
                  
                  // delete old image from local storage
                  fs.unlink('public/images/uploads/' + req.body.previous_product_image, function(err) {
                    if (err) { return next(err); };
                  });

                });
                return;
              };

              // no errors in uploading image to cloudinary

              // update product image_url with the url of the newly submitted image
              product.image_url = results.url

              console.log('New Image Submitted: ', product)

              // save the product to database
              Product.findByIdAndUpdate(req.params.id, product)
                .exec(function(err, result) {
                  if (err) { return next(err); };
                  // successful so render
                  res.redirect('/admin/inventory');

                  // image got successfully uploaded to cloudinary so delete the local stored one
                  fs.unlink('public/images/uploads/' + req.file.filename, function(err) {
                    if (err) { return next(err); };
                  });

                  // delete old product image from cloudinary to save space
                  console.log('Previous imange url: ', req.body.previous_product_image_url)

                  var cloudinaryPreviousImageName = getCldProductImgName(req, req.body.previous_product_image_url);

                  cloudinary.uploader.destroy(cloudinaryPreviousImageName, function(result) { 
                    console.log(result) 
                  });

                  return;
                });

            });

          }
          else {

            // no new image submitted
  
            console.log('No new image submitted: ', product)
  
            // form data is valid so update the record
            Product.findByIdAndUpdate(req.params.id, product)
              .exec( function(err, results) {
                if (err) { return next(err); };
                // successful so redirect
                res.redirect('/admin/inventory')
              });
          }
        }
      },
  ];

  const product_delete_post = (req, res, next) => {

    Product.findByIdAndRemove(req.params.id)
      .exec(function(err, results) {
        if (err) { return next(err); };
        // successful so render
        console.log(results);
        res.redirect('/admin/inventory');

        
        // get cloudinary product image name provided the image url
        var cloudinaryPreviousImageName = getCldProductImgName(req, results.image_url)

        // delete product image from cloudinary image host
        cloudinary.uploader.destroy(cloudinaryPreviousImageName, function(result) { 
          console.log(result) 
        });
        
      })

  }
  
  
  module.exports = {
    inventory,
    product_create_get,
    product_create_post,
    product_detail,
    product_update_post,
    product_delete_post
  }
  