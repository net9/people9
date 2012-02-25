var mongodb = require('./lib/db.js');
var async = require('async');

exports.get_user = function(query, callback) {
  async.waterfall([
    function(callback) {
      mongodb.open(callback);
    },
    function(db, callback) {
      db.collection('users', callback);
    },
    function(collection, callback) {
      collection.findOne(query, callback);
    },
  ], function(err, doc) {
    callback(err, doc);
  });
};

exports.update_net9 = function(net9_user_info, callback) {
  var uid = parseInt(net9_user_info['uid']);
  var username = net9_user_info['username'];
  delete net9_user_info['uid'];
  delete net9_user_info['username'];
  
  async.waterfall([
    function(callback) {
      mongodb.open(callback);
    },
    function(db, callback) {
      db.collection('users', callback);
    },
    function(collection, callback) {
      async.waterfall([
        function(callback) {
          async.parallel([
            function(callback) {
              collection.ensureIndex('uid', {unique: true}, callback);
            },
            function(callback) {
              collection.ensureIndex('username', {unique: true}, callback);
            },
          ], function(err, result) {
            if (err) {
              callback(err);
            } else {
              collection.findOne({uid: uid}, callback);
            }
          });
        },
        function(doc, callback) {
          if (doc) {
            doc.net9 = net9_user_info;
          } else {
            doc = {
              uid: uid,
              username: username,
              net9: net9_user_info,
            };
          }
          collection.update({uid: uid}, doc, {safe: true, upsert: true}, callback);
        },
      ], function(err, result) {
        callback(err);
      });
    },
  ], function(err, result) {
    callback(err);
  });
};