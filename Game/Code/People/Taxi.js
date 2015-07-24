var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');

function Taxi(character) {
	this.character = character;
	global.charles = {};
	this.vec3 = OP.vec3.Create(0,0,0);
	this.base = new BaseAI(this);

	if(global.player && global.player.alive) {
		this.character.dead = true;
		this.character.alive = false;
		return;
	}

	this.target = [0,0,120];

}

Taxi.prototype = {
	interactions: [],

	Update: function(timer, scene) {

		if(this.character.dead) return;

		if(!this.character.alive) {
			var start = this.character.scene.FindPosition(2);
			this.character.Setup(start);
			return;
		}

		this.base.Move(timer);


		if(!this.target && !global.player.alive) {
			global.player.Setup();
		} else {
			global.player.FootPos = this.character.FootPos;
		}

		// this.move = [ -1, -0.98 * 4, 0 ];
		// this.vec3.Set(this.move[0], this.move[1], this.move[2]);
		// OP.physXController.Move(this.character.controller, this.vec3, timer);


	},

	Interact: function() {
        return new Talk(this.character, 'What would you like?');
	}
};

module.exports = Taxi;
