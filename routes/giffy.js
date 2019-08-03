var express = require('express');
var path = require('path');
var router = express.Router();
var util = require('util')
var calipers = require('calipers')('png', 'jpeg');
var fs = require('fs')
const math = require('mathjs')
const { spawn } = require('child_process');
const multer = require('multer');
const bin = 'ffmpeg'
const bin_opts = '-v warning'
const filters = "fps=30,scale=%s:%s:flags=lanczos"


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

var genGenPalParams = function(id, filename, w, h) {
    const globFiles = getClientImagesGlob(id, filename);
    const filtersSized = util.format(filters, w, h)
    const paletteFile = util.format("%s/%s-palette.png", imageFolder, id);
    return `${bin_opts} -f image2 -pattern_type glob -i ${globFiles} -vf ${filtersSized},palettegen -y ${paletteFile}`
}

var genUsePalParams = function(id, filename, w, h) {
    const globFiles = getClientImagesGlob(id, filename);
    const filtersSized = util.format(filters, w, h)
    const paletteFile = util.format("%s/%s-palette.png", imageFolder, id);
    return `${bin_opts} -f image2 -pattern_type glob -i ${globFiles} -i ${paletteFile} -lavfi ${filtersSized} [x]; [x][1:v] paletteuse -f gif -`
}
var getClientImagesGlob = function(id, filename) {
	return util.format(
	  '%s/%s-%s-*%s',
	  imageFolder, imageFormFieldName, id, filename ? path.extname(filename): ''
	);
}

router.post('/', upload.array(imageFormFieldName, max_files), function (req, res, next) {
    if(req.files) {
        var genParams = ''
        calipers.measure(req.files[0].path, function (err, result) {
          w = result.pages[0].width
          h = result.pages[0].height
          if (w > h && w > max_extents){
              h = math.round(h/w * max_extents);
              w = max_extents;
          } else if(h > max_extents)  {
              w = math.round(w/h * max_extents);
              h = max_extents;
          }
		  gp = genGenPalParams(req.body.clientId, req.files[0].path, w, h);
          console.log(`genParams: ${gp}`);
		  genProc = spawn(bin, gp.split(' '));
		  genProc.on('error', (err) => {
		    console.log(`Failed to start subprocess. ${err}`);
		  });
		  genProc.stderr.on('data', (data) => {
		    console.log(`stderr: ${data}`);
		  });
		  genProc.on('close', (code) => {
		    if (code !== 0) {
		  	console.log(`process exited with code ${code}`);
		    }
			req.files.forEach(function(filepath) {
				fs.unlinkSync(filepath.path, (err) => {
				console.log("Failed to delete"  + filepath);
			    });
			});

              up = genUsePalParams(req.body.clientId, req.files[0].path, w, h);
              console.log(`useParams: ${up}`);
              useProc = spawn(bin, up.split(' '));
              useProc.stdout.pipe(res);
		      res.set('Content-Type', 'image/gif');
              useProc.on('error', (err) => {
                console.log(`Failed to start subprocess. ${err}`);
              });
              useProc.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`);
              });
		  });
        });
    }
    else throw 'error';
});

module.exports = router;
