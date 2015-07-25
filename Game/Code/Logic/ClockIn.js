module.exports = function() {
	if(global.job) {
		global.job.clocked = true;
	}
}
