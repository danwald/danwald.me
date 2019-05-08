var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var urlencodedParser = bodyParser.urlencoded({extended: false});
var jsonParser = bodyParser.json();
var port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use('/assets', express.static(__dirname + '/public'));
app.use('/', function(req, res, next){
    console.log("Request: " + req.url);
    next();
});

app.get('/', function(req, res) {
res.render('index')
});

app.listen(port);
