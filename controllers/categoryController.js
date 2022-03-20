var async = require('async');
var Category = require('../models/category');
var Product = require('../models/product');
const { body, validationResult } = require('express-validator');

const category_list = (req, res, next) => {
  
  Category.find()
    .exec( function(err, results) {
      if (err) { return next(err); };
      // successful so render
      res.render('admin/categories_list',
        {
          title: 'Categories',
          categories: results 
        });
    });

};

const category_create_get = (req, res, next) => {

  res.render('admin/category_form', 
    {
      title: 'Create category',
    }
  )
};

const category_create_post = [
  
  // validate and sanitize fields
  body('category_name')
    .not().isEmpty()
    .withMessage('Category name must not be empty.')
    .isLength({min: 3})
    .withMessage('Category name must be at least 3 chars long.')
    .isLength({max: 70})
    .withMessage('Category name must be max 70 chars long.')
    .trim()
    .escape(),
  body('category_description')
    .not().isEmpty()
    .withMessage('Category description must not be empty.')
    .trim()
    .escape(),

    // proceed with request after sanitization
    (req, res, next) => {

      // execute code only if anti_spam field is empty (bots will tend to fill it)
      if (!req.body.anti_spam) {

        // define validation errors from post request
        const errors = validationResult(req);
        
        // create a category with sanitized values
        var category = new Category(
          {
            name: req.body.category_name,
            description: req.body.category_description,        
          }
        );

        if (!errors.isEmpty()) {
          // there are errors. render the form again with sanitized values/error messages

          res.render('admin/category_form',
            {
              title: 'Create category',
              category: category,
              err: errors.array(),
            }
          )
          return;
        }
        else {
          // data from form is valid, save category
          category.save(function(err) {
            if (err) { return next(err); };
            // successful, redirect to category_list
            res.redirect('/admin/categories');
          })
        };
      };
    },

];

const category_update_post = [

  // validate and sanitize fields
  body('category_name')
    .not().isEmpty()
    .withMessage('Category name must not be empty.')
    .isLength({min: 3})
    .withMessage('Category name must be at least 3 chars long.')
    .isLength({max: 70})
    .withMessage('Category name must be max 70 chars long.')
    .trim()
    .escape(),
  body('category_description')
    .not().isEmpty()
    .withMessage('Category description must not be empty.')
    .trim()
    .escape(),

    // proceed with request after sanitization
  (req, res, next) => {

    // execute only if anti_spam is empty (bots will tend to fill it)
    if (!req.body.anti_spam) {

      // define validation errors from post request (handled by express-validator)
      const errors = validationResult(req);

      // create a category with sanitized values
      var category = new Category(
        {
          name: req.body.category_name,
          description: req.body.category_description,
          _id: req.params.id
        }
      );

      if (!errors.isEmpty()) {
        // there are errors. render the form again with sanitized values/error messages
        res.render('admin/category_detail',
          {
            title: 'Edit category' + category.name,
            category: category,
          }
        );
        return;
      }
      else {
        // form data is valid, update category
        Category.findByIdAndUpdate(req.params.id, category)
          .exec(function(err) {
            if (err) { return next(err); };
            // successful, redirect to category_list
            res.redirect('/admin/categories');
          })
      }
    };
  },
];

const category_detail = (req, res, next) => {

  Category.findById(req.params.id)
    .exec( function(err, results) {
      if (err) { return next(err); }
      // successful so render
      res.render('admin/category_detail',
        {
          title: 'Edit category: ' + results.name,
          category: results
        });
    });

};

const category_delete_post = (req, res, next) => {

  Category.findByIdAndRemove(req.params.id)
    .exec(function (err) {
      if (err) { return next(err); };
      // successful so redirect
      res.redirect('/admin/categories');
    });

};

module.exports = {
  category_list,
  category_detail,
  category_create_get,
  category_create_post,
  category_update_post,
  category_delete_post,
}
