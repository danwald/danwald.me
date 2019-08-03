var express = require('express');
var path = require('path');
var router = express.Router();
var util = require('util')
var calipers = require('calipers')('png', 'jpeg');
var fs = require('fs')
const math = require('mathjs')
const { spawn } = require('child_process');
const multer = require('multer');
const cmd = 'ffmpeg'
const params = '-f image2 -framerate 30 -pattern_type glob -i %s %s -f gif -'
const max_extents = 600;
const max_files = 50;
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
var limits = { 'fields': '10', 'fileSize': 1024000, 'files': max_files }
const upload = multer({storage: storage, limits: limits});

router.get('/', function(req, res, next) {
	res.render('giffy');
});

var getClientImagesGlob = function(id, filename) {
	return util.format(
	  '%s/%s-%s-*%s',
	  imageFolder, imageFormFieldName, id, filename ? path.extname(filename): ''
	);
}

router.post('/', upload.array(imageFormFieldName, max_files), function (req, res, next) {
    if(req.files) {
        var scaleParam = ''
        calipers.measure(req.files[0].path, function (err, result) {
        w = result.pages[0].width
        h = result.pages[0].height
        if (w > h && w > max_extents){
		    scaleParam = `-vf scale=${max_extents}:-1:flags=lanczos`;
        } else if(h > max_extents)  {
		    scaleParam = `-vf scale=-1:${max_extents}:flags=lanczos`;
        }
		genParams = util.format(params, getClientImagesGlob(req.body.clientId, req.files[0].path), scaleParam);
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
		  req.files.forEach(function(filepath) {
		  	fs.unlinkSync(filepath.path, (err) => {
		  	console.log("Failed to delete"  + filepath);
		      });
		  });
		});
        });
    }
    else throw 'error';
});

module.exports = router;

