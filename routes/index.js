const express = require('express'),
  router = express.Router(),
  loadBalance = require('./loadBalance');

/* GET Render Changes. */
router.get('/getRenderChanges', (req, res) => {
  loadBalance.getRenderChanges(req, (err, regres) => {
    res.statusCode = regres.http_code;
    res.json(regres);
  })
});

module.exports = router;
