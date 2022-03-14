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
  stock: Number
});

// virtual for URL
ProductSchema
  .virtual('url')
  .get(function() {
    return '/product/' + this._id;
  });

// export model
module.exports = mongoose.model('Product', ProductSchema)
