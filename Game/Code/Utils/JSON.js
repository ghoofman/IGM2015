var fs = require('fs');

module.exports = function(file) {
	return JSON.parse(fs.readFileSync(__dirname + '/../' + file, 'utf8'));
}
