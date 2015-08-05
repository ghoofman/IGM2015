var Talk = require('../Utils/Talk.js');

function CellPhone() {
	this.time = 0;
	if(global.currentScene.name == 'TaxiCab') {
		//global.spawned = false;
		global.memory.taxi = global.memory.taxi || {};
		global.memory.taxi.dropoff = true;
	}
}

CellPhone.prototype = {
	time: 0,

	Interact: function() {
		// find mom
		//global.currentScene.Data.scene.characters
	},

	Update: function(timer, gamepad) {
		this.time += timer.elapsed;
		if(this.time > 3000) {
			if(global.currentScene.name == 'TaxiCab' && !global.ai.mom.talked) {
				global.ai.mom.talked = true;
				global.currentScene.Data.game = new Talk(global.currentScene.Data.scene.characters['Mom'], 'Mom is calling', [
					{ text: 'Answer it', select: function() {
						return global.currentScene.Data.scene.characters['Mom'].ForceInteract();
						}
					},
					{ text: 'Decline' },
				]);
				this.time = 0;

			} else if(global.currentScene.name == 'TaxiCab' && global.ai.mom.talked && !global.ai.dad.talked) {
				global.ai.dad.talked = true;
				global.currentScene.Data.game = new Talk(global.currentScene.Data.scene.characters['Dad'], 'Dad is calling', [
					{ text: 'Answer it', select: function() {
						return global.currentScene.Data.scene.characters['Dad'].ForceInteract();
						}
					},
					{ text: 'Decline' },
				]);

			}
		}
	}

};

module.exports = CellPhone;
