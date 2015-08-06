var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('../Utils/JSON.js');

function Dad(character) {
	this.character = character;
	global.ai.dad = {};
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name == 'Street' && global.win) {
		var start = this.character.scene.FindPosition(102);
		this.character.Setup(start);
		this.Update = this.UpdateWin;
		this.Interact = this.InteractWin;
	} else {

		if(global.currentScene.name != 'TaxiCab' ) {
			this.character.dead = true;
			this.character.alive = false;
			return;
		}
		this.Update = this.UpdateTaxi;
		this.Interact = this.InteractTaxi;
	}
	this.state = 'FIND_REGISTER';
	this.target = null;

	this.base = new BaseAI(this);

}

Dad.prototype = {
	interactions: [],

	UpdateTaxi: function(timer, scene) {
		if(global.win) {
			this.character.rotate += 0.1;
			return;
		}

		if(this.character.dead) return;

		// if(global.ai.mom && global.ai.mom.finishedTalking && !global.ai.dad.talked) {
		// 	global.ai.dad.talked = true;
		// 	global.currentScene.Data.game = this.Interact();
		// }

	},

	InteractTaxi: function() {
		var self = this;

        return new Talk(this.character, 'You get a job with your fancy art degree yet?', [
			{
				text: '( truth ) Not yet.',
				select: function() {
					return new Talk(self.character, 'Tim, you will not be living in my basement. Get a job. Now.', null, function() {
						global.tasks.push({
							text: 'Find a Job',
							complete: function() { return global.inventory.Has('cafe-key'); },
							time: -2000
						});
						global.ai.dad.finishedTalking = true;
					});
				}
			},
			{
				text: '( lie ) Yep! I start first thing in the morning.',
				select: function() {
					global.journal.unshift({
						text: 'Lied to dad about having a job',
						dt: global.time
					});
					global.tasks.push({
						text: 'Find a Job',
						complete: function() { return global.inventory.Has('cafe-key'); },
						time: -2000
					});
					global.ai.dad.finishedTalking = true;
				}
			}
		]);
	},

	InteractWin: function() {
		var self = this;
		return new Talk(self.character, 'Woo, one week. Go Mr. Art Degree.');
	}
};

module.exports = Dad;
