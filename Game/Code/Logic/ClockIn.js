var OptionSelector = require('../Utils/OptionSelector.js');

module.exports = function() {
	if(global.job) {
		var currentHour = global.time.getHours();
		if(global.job.activeSchedule &&
			global.job.activeSchedule.start > currentHour &&
			global.job.activeSchedule.end > currentHour) {
			global.job.clocked = true;
		} else {
			var option = new OptionSelector('My shift hasn\'t started yet.');
			return {
				result: 0,
				next: option
			};
		}
	}

	return {
		result: 0
	};
}
