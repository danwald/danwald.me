var express = require('express');
var router = express.Router();
var util = require('util')
var calipers = require('calipers')('png', 'jpeg');
const math = require('mathjs')
const { spawn } = require('child_process');
const multer = require('multer');
const cmd = 'ffmpeg'
const params = '-f image2 -framerate 10 -i %s -vf scale=%dx%d -f gif -'
const max_extents = 600;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/uploads/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + req.body.clientId +  Date.now())
  }
});
const upload = multer({storage: storage});

router.get('/', function(req, res, next) {
	res.render('giffy');
});

router.post('/', upload.array('photos', 50), function (req, res, next) {
	uploaded_files = req.files
	form_fields = req.body
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
		  genParams = util.format(params, paths.join(' '), w, h);
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

