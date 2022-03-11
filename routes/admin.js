var express = require('express');
var router = express.Router();

router.get('/inventory', function(req, res, next) {
  res.render('admin/inventory', { title: 'Inventory' });
});

module.exports = router;
