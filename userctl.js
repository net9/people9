var messages = require('./messages');
var config = require('./config');
var OAuth = require('./lib/oauth');
var userman = require('./userman.js');
var async = require('async');

var oauth = new OAuth(config.oauth);

exports.displayUser = function displayUser(req, res) {
  var username = req.params.name;
  var user;
  
  async.waterfall([
    function(callback) {
      //Fetch user infomation
      userman.getUser({username: username}, callback);
    },
    function(theUser, callback) {
      if (theUser == null) {
        callback('no-such-user');
        return;
      }
      user = theUser;
      //Fetch domains belong to the user
      userman.getDomains({username: username}, callback);
    },
  ], function(err, domains) {
    if (err) {
      req.flash('error', err);
      res.redirect('/');
      return;
    }
    res.render('user', {
      locals: {
        title: messages.get('user'),
        returnto: req.query.returnto,
        userinfo: user.net9,
        domains: domains,
      },
    });
  });
};

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
      userman.updateNet9(user_info, function(err) {
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

exports.checkLogin = function regDomain(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    req.flash('error', 'not-login');
    res.redirect('/');
  }
};

exports.regDomain = function regDomain(req, res) {
  var domainName = req.params.name;
  if (domainName) {
    userman.getDomains({name: domainName}, function(err, domains) {
      if (err || domains.length !== 1) {
        req.flash('error', 'no-such-domain');
        res.redirect('/' + req.session.username);
      } else {
        var domain = domains[0];
        res.render('regdomain', {
          locals: {
            title: messages.get('edit-domain-information'),
            username: req.session.username,
            domain: domain,
            returnto: req.query.returnto,
          },
        });
      }
    });
  } else {
    res.render('regdomain', {
      locals: {
        title: messages.get('register-new-domain'),
        username: req.session.username,
        domain: null,
        returnto: req.query.returnto,
      },
    });
  }
};

exports.regDomainDo = function regDomain(req, res) {
  userman.regDomain({
    username: req.session.username,
    name: req.body.name,
    ip: req.body.ip,
    desc: req.body.desc,
  }, function(err) {
    if (err) {
      req.flash('error', err);
    }
    res.redirect('/' + req.session.username);
  });
};