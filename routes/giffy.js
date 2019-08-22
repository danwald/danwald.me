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
const max_extents = 800;
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
var limits = { 'fields': '10', 'fileSize': 3072000, 'files': max_files }
const upload = multer({storage: storage, limits: limits});

router.get('/', function(req, res, next) {
	res.render('giffy');
});

var getClientImagesGlob = function(id, filename) {
	return util.format(
	  '"%s/%s-%s-*%s"',
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
	        scaleComplex = `scale=${max_extents}:-1:flags=lanczos`;
        } else if(h > max_extents)  {
	        scaleComplex = `scale=-1:${max_extents}:flags=lanczos`;
        }
	    subProc = spawn(
          cmd,
          [
            '-loglevel', 'error', //log errors
            '-f', 'image2', // input as a list of files
            '-pattern_type', 'glob', '-i', getClientImagesGlob(req.body.clientId, req.files[0].path),
            '-filter_complex', 
            `"[0:v] fps=30,${scaleComplex},split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1"`,
            '-f', 'gif', '-' /*output*/
          ],
          {shell : true} //there might be a loophole with filenames that I am missing but input is sanitized
        );

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

