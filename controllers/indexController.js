var async = require('async');
var Category = require('../models/category');
var Product = require('../models/product');

const index = (req, res, next) => {
  res.render('index', { title: "Mini's Fragrance Library" });
};

const shop = (req, res, next) => {
  res.render('shop', { title: "Shop" })
};

const about = (req, res, next) => {
  res.render('about', { title: "About" })
};

const contact = (req, res, next) => {
  res.render('contact', { title: "Contact" })
};

module.exports = {
  index,
  shop,
  about,
  contact,
}
