var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('../Utils/JSON.js');

function Bum(character) {
	this.character = character;
	global.ai.Bum = {};
	if(!global.memory.bum) {
		global.memory.bum = {};
	}
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name == 'Street' && global.win) {
		var start = this.character.scene.FindPosition(99);
		this.character.Setup(start);
		this.Update = this.UpdateWin;
		this.Interact = this.InteractWin;
	} if(global.currentScene.name == 'Street' && global.memory.bum.hasSandwich) {
		var start = this.character.scene.FindPosition(300);
		this.character.Setup(start);
		this.Update = this.UpdateStreet;
		this.Interact = this.InteractStreet;
	} else {

		if(global.memory.bum.hasSandwich || global.currentScene.name != 'GLOBALBedroom' ) {
			this.character.dead = true;
			this.character.alive = false;
			return;
		} else {
			var start = this.character.scene.FindPosition(4);
			this.character.Setup(start);
			this.character.rotate = -3.14 / 3.0;
			this.Update = this.UpdateBedroom;
			this.Interact = this.InteractBedroom;
		}
	}

	this.target = null;

	this.base = new BaseAI(this);

}

Bum.prototype = {
	interactions: [],

	UpdateBedroom: function(timer, scene) {
	},

	UpdateStreet: function(timer, scene) {
	},

	UpdateWin: function(timer, scene) {
		if(global.win) {
			this.character.rotate += 0.1;
			return;
		}
	},

	AgreeToLeave: function() {
		global.memory.bum.hasSandwich = true;

		global.inventory.Remove('sandwich');
		return new Talk(this.character, 'Fine, but not until I eat my sandwich.')
	},

	AskForSandwich: function() {
		var self = this;
		return new Talk(this.character, 'You have a sandwich. I want it.',
			[ { text: 'Alright, but you have to leave my apartment then.', select: function() {
				return self.AgreeToLeave();
			} },
			  { text: 'It\'s my sandwich. Buzz off.' }]
		);
	},

	InteractBedroom: function() {
		var self = this;

		if(global.inventory.Has('sandwich')) {
			return this.AskForSandwich();
		}

        return new Talk(this.character, 'Leave me alone.');
	},

	InteractWin: function() {
		var self = this;

		if(global.currentScene.name == 'Street' && global.memory.bum.hasSandwich) {
			return new Talk(this.character, 'Sandwich was good.');
		}

        return new Talk(this.character, 'Leave me alone.');
	},

	InteractStreet: function() {
		var self = this;

        return new Talk(this.character, 'Leave me alone.');
	}
};

module.exports = Bum;
