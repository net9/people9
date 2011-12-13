var url = require('url');
var http = require('http');
var https = require('https');
var events = require('events');
var querystring = require('querystring');

var OAuth = module.exports = function(oauth_info) {
  var self = this;
  var events_emitter = new events.EventEmitter();

  var urlget;
  if (oauth_info.protocol == 'https') {
    urlget = https.get.bind(https);
  } else {
    urlget = http.get.bind(http);
  }

  this.on = events_emitter.on.bind(events_emitter);

  this.authorize = function(redirect_uri, callback) {
    callback(url.format({
      protocol: oauth_info.protocol,
      hostname: oauth_info.host,
      pathname: oauth_info.authorize_path,
      query: {
        client_id: oauth_info.client_id,
        redirect_uri: redirect_uri,
      },
    }));
  };
  
  this.get_access_token = function(code, callback_uri, callback) {
    req_path = oauth_info.access_token_path + '?' + querystring.stringify({
      client_id: oauth_info.client_id,
      client_secret: oauth_info.secret,
      code: code,
      redirect_uri: callback_uri,
    });
    oauth_req = urlget({
      host: oauth_info.host,
      path: req_path,
    }, function(oauth_res) {
      oauth_res.on('data', function(data) {
        data = JSON.parse(data);
        if (data.error !== undefined) {
          events_emitter.emit('error', data.error);
          return;
        }
        self.access_token = data.access_token;
        self.expires = new Date();
        self.expires.setTime(self.expires.getTime() + data.expires_in);
        callback(self.access_token);
      });
    }).on('error', function(error) {
      events_emitter.emit('error', error);
    });
  };
  
  this.get_userinfo = function(callback) {
    req_path = oauth_info.userinfo_path + '?' + querystring.stringify({
      access_token: self.access_token,
    });
    oauth_req = urlget({
      host: oauth_info.host,
      path: req_path,
    }, function(oauth_res) {
      oauth_res.on('data', function(data) {
        data = JSON.parse(data);
        if (data.success === true) {
          data = data.userinfo;
          callback(data);
        } else {
          events_emitter.emit('error', undefined);
        }
      });
    }).on('error', function(error) {
      events_emitter.emit('error', error);
    });
  };
};
