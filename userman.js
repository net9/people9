var mongodb = require('./lib/db.js');

exports.get_user = function(query, callback) {
  mongodb.open(function(err, db) {
    if (err) {callback(err); return;}
    db.collection('users', function(err, collection) {
      if (err) {callback(err); return;}
      collection.findOne(query, function(err, doc) {
        callback(err, doc);
      });
    });
  });
};

exports.update_net9 = function(net9_user_info, callback) {
  var uid = parseInt(net9_user_info['uid']);
  var username = net9_user_info['username'];
  delete net9_user_info['uid'];
  delete net9_user_info['username'];
  mongodb.open(function(err, db) {
    if (err) {callback(err); return;}
    db.collection('users', function(err, collection) {
      if (err) {callback(err); return;}
      collection.ensureIndex("uid", {unique: true}, function(err, indexName) {
        collection.ensureIndex("username", {unique: true}, function(err, indexName) {
          if (err) {callback(err); return;}
          collection.findOne({uid: uid}, function(err, doc) {
            if (err) {callback(err); return;}
            if (doc) {
              doc.net9 = net9_user_info;
            } else {
              doc = {
                uid: uid,
                username: username,
                net9: net9_user_info,
              };
            }
            collection.update({uid: uid}, doc, {safe: true, upsert: true},function(err, doc) {
              callback(err);
            });
          });
        });
      });
    });
  });
};