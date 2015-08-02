var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('../Utils/JSON.js');

function Bum(character) {
	this.character = character;
	global.ai.Bum = {};
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name != 'GLOBALBedroom' ) {
		this.character.dead = true;
		this.character.alive = false;
		return;
	} else {
		var start = this.character.scene.FindPosition(4);
		this.character.Setup(start);
		this.character.rotate = -3.14 / 3.0;
	}

	this.target = null;

	this.base = new BaseAI(this);

}

Bum.prototype = {
	interactions: [],

	Update: function(timer, scene) {

		//if(this.character.dead) return;

	},

	Interact: function() {
		var self = this;

        return new Talk(this.character, 'Leave me alone.');
	}
};

module.exports = Bum;
