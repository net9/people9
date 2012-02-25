var config = require('./config');
var messages = require('./messages/getter');
var OAuth = require('./lib/oauth');
var userman = require('./userman.js');

var oauth = new OAuth(config.oauth);

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('index', {
      locals: {
        title: messages.get('Index'),
        returnto: req.query.returnto,
      },
    });
  });
  
  app.get('/auth', function (req, res) {
    site_uri = 'http://' + req.headers.host;
    callback_uri = site_uri + '/auth_callback';
    
    oauth.authorize(callback_uri, function(redirect_uri){
      res.redirect(redirect_uri);
    });
  });
  
  app.get('/auth_callback', function (req, res) {
    error = req.param('error');
    code = req.param('code');
    var on_error = function(error) {
      req.flash('error', error);
      res.redirect('/');
    };
    
    if (error !== undefined || code === undefined) {
      on_error(error);
      return;
    }
    
    site_uri = 'http://' + req.headers.host;
    callback_uri = site_uri + '/auth_callback';

    oauth.on('error', on_error);
    oauth.get_access_token(code, callback_uri, function(access_token){
      oauth.get_userinfo(function(user_info) {
        var username = user_info.username;
        userman.update_net9(user_info, function(err) {
          if (err) {
            on_error(err);
            return;
          }
          res.redirect('/' + username);
        });
      });
    });
  });
  
  app.get('/:name', function (req, res) {
    var username = req.params.name;
    userman.get_user({username: username}, function(err, user) {
      if (user == null) {
        req.flash('error', 'no-such-user');
        res.redirect('/');
        return;
      }
      res.render('user', {
        locals: {
          title: messages.get('User'),
          returnto: req.query.returnto,
          userinfo: user.net9,
        },
      });
    });
  });
};
