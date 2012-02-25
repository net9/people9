var messages = require('./messages');
var config = require('./config');
var OAuth = require('./lib/oauth');
var userman = require('./userman.js');
var oauth = new OAuth(config.oauth);

exports.login = function login(req, res) {
  site_uri = 'http://' + req.headers.host;
  callback_uri = site_uri + '/auth_callback';
  
  oauth.authorize(callback_uri, function(redirect_uri){
    res.redirect(redirect_uri);
  });
};

exports.logout = function logout(req, res) {
  var redirectURL = req.query.returnto || '/';
  req.session.username = null;
  res.redirect(redirectURL);
};

exports.authCallback = function authCallback(req, res) {
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
        req.session.username = username;
        res.redirect('/' + username);
      });
    });
  });
};

exports.displayUser = function displayUser(req, res) {
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
};

exports.regDomain = function regDomain(req, res) {
  res.render('regdomain', {
    locals: {
      title: messages.get('Index'),
      returnto: req.query.returnto,
    },
  });
};