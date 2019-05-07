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

app.get('/person/:id', function(req, res) {
res.render('person', {ID:req.params.id})
});

app.post('/person', urlencodedParser, function(req, res) {
    res.send('Thanks!');
    console.log(req.body);
});

app.post('/personjson', jsonParser, function(req, res) {
    res.send('Thanks Json!!');
    console.log(req.body.firstname);
    console.log(req.body.lastname);
});

app.get('/api', function(req, res) {
    res.json({firstname: 'dan', lastname: 'wald'});
});


app.listen(port);
