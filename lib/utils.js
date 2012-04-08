exports.getSiteUrl = function(req) {
  var host;
  var protocol = 'http';
  if (req.headers['x-forwarded-host'] !== undefined) {
    host = req.headers['x-forwarded-host'];
  } else {
    host = req.headers['host'];
  }
  return protocol + '://' + host;
};
