var OptionSelector = require('../Utils/OptionSelector.js');
var OPgameState = require('OPgameState');

module.exports = function(collision) {
	console.log('CLOCKING OUT');

		console.log(global.job);
	if(global.job) {
		var currentHour = global.time.getHours();
		console.log(currentHour, global.job.clocked, global.job.activeSchedule);

		if(global.job.clocked && global.job.activeSchedule &&
			global.job.activeSchedule.end > currentHour) {

				var option = new OptionSelector('If I leave in the middle of my shift I\'ll lose my job.', [
					{ text: 'Leave anyway', select: function() {
							global.inventory.Remove('cafe-key');
							global.job.clocked = false;
							global.job = null;

							if(collision.data.file) {
								global.AudioPlayer.PlayEffect('Audio/Door.wav');
								//MixPanel.Track("Opened Door in " + global.currentScene.Data.scene.data.name, { state: global.currentScene.Data.scene.data.name, id: collision.id });
								var SceneCreator = require('../SceneCreator.js');
								OPgameState.Change(new SceneCreator(collision.data.file, collision.id));
								return 1;
							}

							return {
								result: 1
							};
						}
					},{ text: 'Nevermind', select: function() {
						return {
							result: 1
						};
					} }
				]);

				return {
					result: 1,
					next: option
				};
		}
		global.job.clocked = false;
	}

	return {
		result: 0
	};
}
