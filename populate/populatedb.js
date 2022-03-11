#! /usr/bin/env node

// Usage: 
// $ node populatedb mongodb+srv://admin:<password>@cluster0.omje9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

var userArgs = process.argv.slice(2);

var async = require('async');
var Category = require('../models/category');
var Product = require('../models/product');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// arrays that will store the successfully created records
var categories = []; // need this to fetch the category ID that will be added to each product
var products = [];

// function to create the individual category
function categoryCreate(name, description, callback) {
  var categorydetail = { name:name, description:description }
  
  var category = new Category(categorydetail);

  category.save(function(err) {
    if (err) {
      callback(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category);
    callback(null, category);
  });
};

// function to create the individual product
function productCreate(name, description, category, price, stock, callback) {
  var productdetail = { 
    name:name, 
    description:description, 
    category:category,
    price:price,
    stock:stock 
  };

  var product = new Product(productdetail);

  product.save(function(err) {
    if (err) {
      callback(err, null)
      return
    }
    console.log('New Product: ' + product);
    products.push(product);
    callback(null, product);
  });
};


// function that will create multiple categories
function createCategories(cb) {
  async.parallel([
    function(callback) {
      categoryCreate('Parfum', 'Parfum, also known as extrait de parfum or pure perfume, has the highest fragrance concentration. Parfum will contain anywhere from 15% to 40% fragrance however concentration is generally between 20% to 30% for most parfums. Of all scents, parfums last the longest; usually six to eight hours. Parfum generally also commands the highest price of all the fragrance types due to the high concentration of fragrance. People with sensitive skin may do better with parfums as they have far less alcohol than other fragrance types and therefore are not as likely to dry out the skin.', callback);
    },
    function(callback) {
      categoryCreate('Eau de Parfum', 'After parfum, eau de parfum (EDP) has the next highest concentration of fragrance. Eau de parfum generally has a fragrance concentration of between 15% and 20%. On average, eau de parfum will last for four to five hours. It is also generally less expensive that parfum and while it does have a higher concentration of alcohol than parfum, it is better for sensitive skin than other fragrance types. Eau de parfum is one of the most common fragrance types and is suitable for everyday wear.', callback);
    },
    function(callback) {
      categoryCreate('Eau de Toilette', 'Eau de toilette (EDT) has a fragrance concentration of between 5% and 15%. It is cheaper than eau de parfum and is one of the most popular types of fragrance available. EDT fragrance will normally last for two to three hours. Eau de toilette is considered by some to be for daywear while eau de parfum is considered nightwear. The term eau de toilette came from the French term “faire sa toilette” which means getting ready.', callback);
    },
    function(callback) {
      categoryCreate('Eau de Cologne', 'Eau de cologne, or EDC, has a much lower concentration of fragrance than the above types of perfume. EDC generally has a 2% to 4% percent concentration of fragrance and a high concentration of alcohol. It is cheaper than other types of fragrance however the scent generally only lasts for up to two hours. EDC generally comes in bigger bottles and more of the fragrance needs to be used. Originally eau de cologne referred to a traditional recipe that used herb and citrus notes with little anchoring with base notes.', callback);
    },
    function(callback) {
      categoryCreate('Eau Fraiche', 'Eau fraiche is similar to eau de cologne in that the scent will generally last for up to two hours. Eau fraiche has an even lower concentration of fragrance than eau de cologne, normally only 1% to 3%. While eau fraiche has a low fragrance concentration, it does not contain a high amount of alcohol. Along with the fragrance, the remainder of eau fraiche is mostly water.', callback);
    }
  ], cb);
};


// function that will create multiple products
function createProducts(cb) {
  async.parallel([
    function(callback) {
      productCreate('Favorite Character Death', 'Whenever you will feel the scent of this fragrance you will experience the same emotions you feel whenever your favorite character of the book dies.', categories[0], 69.99, 20, callback)
    },
    function(callback) {
      productCreate('Unfinished Storyline', "Experience the pleasure of reading a good book that doesn't have a complete storyline. But don't worry, the next book will never be published because the first one didn't make enough sales.", categories[1], 120.69, 46, callback)
    },
    function(callback) {
      productCreate('Poorly Written', 'By smelling the scent of this parfum you will feel like reading a poorly written book full of grammar errors.', categories[2], 16.99, 5, callback)
    },
    function(callback) {
      productCreate('Overpriced Book', "Discover our latest innovation: you will feel like reading a book that you paid way too much for, and that you don't even like that much. That wallet is going to be empty for a while!", categories[3], 1029.99, 2, callback)
    },
    function(callback) {
      productCreate('Birthday gift', "By smelling this scent you will experience the feeling of being gifted a book for your birthday. Too bad you hate its genre and don't like the author that much. It's going to accumulate a lot of dust on the shelf.", categories[4], 0.99, 1000, callback)
    },
    function(callback) {
      productCreate("Cicero", 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error eos laudantium commodi quo. Deserunt esse, ab porro nulla dolore molestiae molestias sint quae, magni sunt, architecto quisquam necessitatibus officia excepturi.', categories[0], 40.10, 1, callback)
    },
    function(callback) {
      productCreate('Boring', 'Smelling this parfum will make you fall asleep like the most boring book you ever read.', categories[3], 69.99, 20, callback)
    },
    function(callback) {
      productCreate('Popular Saga', "It smells like you don't know why everyone liked this book so much. Maybe you're in time to refun it?", categories[2], 19.99, 140, callback)
    },
    function(callback) {
      productCreate('Dictionary', "This smell will instantly give you the knowledge of all words in the dictionary. Just a smell and you will gain the knowledge of every word ever existed.", categories[4], 69.99, 20, callback)
    },
    function(callback) {
      productCreate('Fresh Books', "Who doesn't like the smell of fresh books? We certainly do. With this perfume we captured the smell of fresh books and incapsulated it in a bottle so you can use it whenever you want!", categories[1], 5.99, 405, callback)
    },
  ], cb)
};

// the order is really important since the products need the categories to be created first.
async.series([
  createCategories,
  createProducts
], function(err, results) {
  if (err) {
    console.log('Final err: ' + err);
  }
  else {
    console.log(results)
  }
  // all done, disconnect from database
  mongoose.connection.close();
});
