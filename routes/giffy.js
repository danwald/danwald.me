var express = require('express');
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});
var router = express.Router();
var util = require('util')
var calipers = require('calipers')('png', 'jpeg');
const math = require('mathjs')
const { spawn } = require('child_process');
const cmd = 'ffmpeg'
const params = '-framerate 10 -i %s -vf scale=%dx%d -f gif -'
const max_extents = 600;

router.get('/', function(req, res, next) {
	res.render('giffy');
});

router.post('/', upload.array('photos', 50), function (req, res, next) {
	uploaded_files = req.files
    if(uploaded_files) {
		var paths = []
        var genParams = ''
		uploaded_files.forEach(function(file){
			paths.push(file['path'])
		});
	    //console.log(`paths: ${paths}`);
        calipers.measure(paths[0], function (err, result) {
          w = result.pages[0].width
          h = result.pages[0].height
          if (w > h){
              h = math.round(h/w * max_extents);
              w = max_extents;
          } else {
              w = math.round(w/h * max_extents);
              h = max_extents;
          }
          //console.log(result)
		  genParams = util.format(params, paths.join(' -i '), w, h);
		  console.log(`cmd: ${cmd}`);
		  console.log(`genParams: ${genParams}`);
		  subProc = spawn(cmd, genParams.split(' '));
		  res.set('Content-Type', 'image/gif');
		  subProc.stdout.pipe(res);
		  subProc.on('error', (err) => {
		    console.log(`Failed to start subprocess. ${err}`);
		  });
		  subProc.stderr.on('data', (data) => {
		    console.log(`stderr: ${data}`);
		  });
		  subProc.on('close', (code) => {
		    if (code !== 0) {
		  	console.log(`process exited with code ${code}`);
		    }
		  });
        });
    }
    else throw 'error';
});

module.exports = router;

