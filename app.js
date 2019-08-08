var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var jsonParser = bodyParser.json();
var port = process.env.PORT || 3000;
var indexRouter = require('./routes/index');
var giffyRouter = require('./routes/giffy');
var app = express();

app.use(logger('dev'));
app.set('view engine', 'ejs');
app.use('/assets', express.static(__dirname + '/public'));


app.use('/', indexRouter);
app.use('/giffy', giffyRouter);
app.listen(port);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  //res.json(err.message)
});

module.exports = app;
