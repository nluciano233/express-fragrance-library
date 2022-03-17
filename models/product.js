var mongoose = require('mongoose');
Schema = mongoose.Schema;

var ProductSchema = Schema({
  name: {
    type: String,
    min: [3, 'Name too short.'],
    max: [70, 'Name too long.'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image_id: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  image_url: {
    type: String,
    required: true
  }
});

// virtual for URL
ProductSchema
  .virtual('url')
  .get(function() {
    var productName = this.name
    var hyphenProductName = productName.replace(/\s/g, '-')
    return '/product/' + this._id + hyphenProductName
  });

// virtual for admin url for editing the product
ProductSchema
  .virtual('admin_url')
  .get(function() {
    return '/admin/product/' + this._id
  });

// export model
module.exports = mongoose.model('Product', ProductSchema)
