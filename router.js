var messages = require('./messages');
var userctl = require('./userctl');

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('index', {
      locals: {
        title: messages.get('Index'),
        returnto: req.query.returnto,
      },
    });
  });
  
  app.get('/login', userctl.login);
  app.get('/logout', userctl.logout);
  app.get('/auth_callback', userctl.authCallback);
  app.get('/regdomain', userctl.regDomain);
  app.get('/:name', userctl.displayUser);
};
