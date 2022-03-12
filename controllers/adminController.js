var async = require('async');
var Category = require('../models/category');



const inventory = (req, res, next) => {

  res.render('admin/inventory', { title: 'Inventory' } )
}

const product_create_get = (req, res, next) => {

  Category
    .find({}, 'name')
    .exec(function(err, list_categories) {
      if (err) {return next(err);}
      // successful so render
      res.render('admin/product_form', 
        {
          title: 'Create product',
          categories: list_categories 
        });  
    });

};

const product_create_post = (req, res, next) => {
  
}


module.exports = {
  inventory,
  product_create_get,
  product_create_post
}
