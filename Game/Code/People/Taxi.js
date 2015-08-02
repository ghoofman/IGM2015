var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');

function Taxi(character) {
	this.character = character;
	global.charles = {};
	this.vec3 = OP.vec3.Create(0,0,0);
	this.base = new BaseAI(this);

	if(global.currentScene.name != 'Street' ) {
		this.character.dead = true;
		this.character.alive = false;
		return;
	}

	if(global.spawned) {
		this.character.dead = true;
		this.character.alive = false;
		return;
	} else {
		global.player.alive = false;
	}

	this.target = [-1500,0,120];
}

Taxi.prototype = {
	interactions: [],

	Update: function(timer, scene) {

		if(this.character.dead) return;
		//
		if(!this.character.alive) {
			var start = [0,0,120];// = this.character.scene.FindPosition(2);
			this.character.Setup(start);

	        // this.character.vec3.Set(20 * this.character.scale, 20 * this.character.scale, 20 * this.character.scale);
	        // var shape = OP.physX.AddBoxShape(this.character.controller.actor, this.character.material, this.character.vec3);
		//
		// 	var pos = global.player.FootPos;
		// 	var start = [pos.x,pos.y,pos.z - 30];
		//
		// 	return;
		}
		//
		this.base.Move(timer);
		//
		//
		if(!global.player.alive) {
			var pos = global.player.FootPos;
			var start = [0,0,120 - 30];
			global.player.Setup(start);
			global.journal.unshift({
				text: 'Arrived in Fareville',
				dt: global.time
			});
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
