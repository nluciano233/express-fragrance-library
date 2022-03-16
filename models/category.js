var mongoose = require('mongoose');
Schema = mongoose.Schema;

var CategorySchema = Schema({
  name: {
    type: String,
    min: [3, 'Name too short.'],
    max: [70, 'Name too long.'],
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
});

// virtual for url
CategorySchema
  .virtual('url')
  .get(function() {
    return '/category/' + this.name
  });

CategorySchema
  .virtual('admin_url')
  .get(function() {
    return '/admin/category/' + this._id
  })

// export model
module.exports = mongoose.model('Category', CategorySchema)
