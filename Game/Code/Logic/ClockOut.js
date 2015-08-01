module.exports = function() {
	if(global.job) {
		var currentHour = global.time.getHours();
		if(global.job.clocked && global.job.activeSchedule &&
			global.job.activeSchedule.end < currentHour) {
				
			global.inventory.Remove('cafe-key');
			global.job.clocked = false;
			global.job = null;
		}
		global.job.clocked = false;
	}
}
