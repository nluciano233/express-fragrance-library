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

module.exports = {
  category_list
}
