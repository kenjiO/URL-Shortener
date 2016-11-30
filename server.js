var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var validUrl = require('valid-url');

mongoose.connect(process.env.MONGOLAB_URL);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var Url = require('./models/url');

app.get('/', function(req, res, next) {
  res.render('new');
});

app.post('/', function(req, res, next) {
  if (!req.body.myURL) {
    res.send("URL to shorten not received");
  }
  
  Url.find(function(err, urls) {
    if (err) return next(err);
    var urlNumber = urls.length;
    var shortenedURL = req.body.myURL;
    
    if (!validUrl.isUri(shortenedURL) || shortenedURL === 'http://') {
      res.json({"error": "Invalid URL"});
      return;
    }
    
    var promise = Url.create({shortened: urlNumber, url: shortenedURL}, function(err, urlInstance) {
      if (err) {
        return next(err);
      } else {
        res.json({url: "https://url-kenjio.c9users.io/" + urlNumber});
      }
    });
  });
});


app.use(/^\/\d+$/, function(req, res, next) {
  var urlNumber = req.originalUrl.slice(1);
  
  Url.findOne({shortened: urlNumber}, function(err, urlInstance) {
    if (err) {
      next(err);
    }
    if (urlInstance) {
      //res.send(urlInstance.url);
      res.redirect(urlInstance.url);
    } else {
      res.send("Invalid URL");
    }
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.error =  err ;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Express server listening on port ", port);
});
