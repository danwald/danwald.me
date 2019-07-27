var express = require('express');
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});
var router = express.Router();
var util = require('util')
var calipers = require('calipers');
const { exec } = require('child_process');
const cmd = 'ffmpeg -framerate 10 -i ${files} -vf scale=${w_h} -f gif'

router.get('/', function(req, res, next) {
	res.render('giffy');
});

router.post('/', upload.array('photos', 10), function (req, res, next) {
	uploaded_files = req.files
    if(uploaded_files) {
		paths = []
		uploaded_files.forEach(function(file){
			paths.push(file['path'])
		});
	    res.json(paths.join(' '));
    }
    else throw 'error';
});

module.exports = router;

