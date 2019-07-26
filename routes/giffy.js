var express = require('express');
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('giffy');
});

router.post('/', upload.single('photo'), (req, res) => {
    if(req.file) {
        res.json(req.file);
    }
    else throw 'error';
});

module.exports = router;

