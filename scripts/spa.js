// Single Page Apps - redirect to / except when a file extension is given
var path = require('path');
module.exports = function(req, res, next) {
	if (req.method !== "GET" && req.method !== "HEAD")
		next();
	if (req.url !== '/' && path.extname(req.url) === '') {
		req.url = '/';
		next();
	}
	else next();
}
