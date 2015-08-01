module.exports = function() {
	if(global.job) {
		var currentHour = global.time.getHours();
		if(global.job.activeSchedule &&
			global.job.activeSchedule.start > currentHour &&
			global.job.activeSchedule.end > currentHour) {
			global.job.clocked = true;
		}
	}
}
