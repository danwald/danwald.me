var express = require('express');
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});
var router = express.Router();
var util = require('util')
var calipers = require('calipers')('png', 'jpeg');
const math = require('mathjs')
const { exec } = require('child_process');
const cmd = 'ffmpeg -framerate 10 -i %s -vf scale=%dx%d -f gif'
const max_extents = 800;

router.get('/', function(req, res, next) {
	res.render('giffy');
});

router.post('/', upload.array('photos', 10), function (req, res, next) {
	uploaded_files = req.files
    if(uploaded_files) {
		paths = []
        w_h = ''
		uploaded_files.forEach(function(file){
			paths.push(file['path'])
		});
	    //res.json(paths.join(' '));
        calipers.measure(paths[0], function (err, result) {
          //res.json(result)
          w = result.pages[0].width
          h = result.pages[0].height
          if (w > h){
              h = math.round(h/w * max_extents);
              w = max_extents;
          } else {
              w = math.round(w/h * max_extents);
              h = max_extents;
          }
          res.json({ 'cmd': util.format(cmd, paths.join(' '), w, h)});
        });


    }
    else throw 'error';
});

module.exports = router;

