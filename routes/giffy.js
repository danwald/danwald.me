var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.writeHead(200, { 'Content-Type': 'text/json' });
    var obj = {
		appName: 'Giffy',
    }
    res.end(JSON.stringify(obj));
});

module.exports = router;

