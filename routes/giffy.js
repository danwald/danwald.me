var express = require('express');
var path = require('path');
var router = express.Router();
var util = require('util')
var calipers = require('calipers')('png', 'jpeg');
const math = require('mathjs')
const { spawn } = require('child_process');
const multer = require('multer');
const cmd = 'ffmpeg'
const params = '-f image2 -framerate 30 -pattern_type glob -i %s -vf scale=%dx%d -f gif -'
const max_extents = 600;
const imageFolder = __dirname + '/uploads/images'
const imageFormFieldName = 'photos'

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageFolder)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + req.body.clientId + '-' + file.originalname)
  }
});
const upload = multer({storage: storage});

router.get('/', function(req, res, next) {
	res.render('giffy');
});

var getClientImagesGlob = function(id, filename) {
	return util.format(
	  '%s/%s-%s-*%s',
	  imageFolder, imageFormFieldName, id, filename ? path.extname(filename): ''
	);
}

router.post('/', upload.array(imageFormFieldName, 50), function (req, res, next) {
    if(req.files) {
        var genParams = ''
        calipers.measure(req.files[0].path, function (err, result) {
          w = result.pages[0].width
          h = result.pages[0].height
          if (w > h){
              h = math.round(h/w * max_extents);
              w = max_extents;
          } else {
              w = math.round(w/h * max_extents);
              h = max_extents;
          }
		  genParams = util.format(params, getClientImagesGlob(req.body.clientId, req.files[0].path), w, h);
		  subProc = spawn(cmd, genParams.split(' '));
		  res.set('Content-Type', 'image/gif');
		  subProc.stdout.pipe(res);
		  subProc.on('error', (err) => {
		    //console.log(`Failed to start subprocess. ${err}`);
		  });
		  subProc.stderr.on('data', (data) => {
		    //console.log(`stderr: ${data}`);
		  });
		  subProc.on('close', (code) => {
		    if (code !== 0) {
		  	console.log(`process exited with code ${code}`);
		    }
			delProc = spawn(util.format('rm' , [getClientImagesGlob(req.body.clientId)]));
			delProc.on('close', (code) => {
			  if (code !== 0) {
			    console.log(`delete process exited with code ${code}`);
			  }
			  else {
			    console.log(`delete process removed client files`);
			  }
			});
			  delProc.on('error', (err) => {
				console.log(`del error: ${err}`);
			  });
			  delProc.stderr.on('data', (data) => {
				console.log(`del stderr: ${data}`);
			  });
		  });
        });
    }
    else throw 'error';
});

module.exports = router;

