var express = require('express');
var messages = require('./messages');
var app = express.createServer();

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'net9-people' }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.router(require('./router')));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.logger());
});

app.configure('production', function () {
  app.use(express.errorHandler()); 
});

app.helpers({
  msg: messages.get.bind(messages),
  pageTitle: function (title) {
    if (title) {
      return messages.get('page-title', title);
    } else {
      return messages.get('index-page-title');
    }
  },
});

app.dynamicHelpers({
  session: function (req, res){
    return req.session;
  },
  flashArray: function (req, res) {
    var flash = req.flash();
    var flashes = [];
    for (var key in flash) {
      flash[key].forEach(function (msg) {
        flashes.push({ type: key, message: msg });
      });
    }
    return flashes;
  },
});

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}