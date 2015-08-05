var OptionSelector = require('../Utils/OptionSelector.js');

module.exports = function() {
	var option = new OptionSelector('Whoa. It\'s a fake wall!', null, function() {
		return {
			result: 1
		};
	});
	return {
		result: 1,
		next: option
	};
}
