var OptionSelector = require('../Utils/OptionSelector.js');

module.exports = function() {
	var option = new OptionSelector('Whoa. It\'s a fake wall! Something feels different.', null, function() {
		global.debug = true;
		return {
			result: 1
		};
	});
	return {
		result: 1,
		next: option
	};
}
