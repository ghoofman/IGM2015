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

	if(global.memory.taxi && global.memory.taxi.dropoff) {
		global.player.alive = false;
		this.start = [0,0,120];
		this.target = [-1500,0,120];
		global.player.Position([0, 0, 90]);
	} else {
		if(Math.random() > 0.8) {
			this.character.dead = false;
			this.character.alive = false;
			this.target = [-1500,130,-120];
			this.start = [1000,130,-120];
			this.base.speed = 3;
		} else {
			this.character.dead = true;
			this.character.alive = false;
		}
		return;
	}

}

Taxi.prototype = {
	interactions: [],

	Update: function(timer, scene) {

		if(this.character.dead) return;

		if(global.memory.taxi && global.memory.taxi.dropoff) {
			global.memory.taxi.dropoff = false;
			global.player.Position([0, 0, 90]);
		}

		//
		if(!this.character.alive) {
			// = this.character.scene.FindPosition(2);
			this.character.Setup(this.start);

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
		// if(!global.player.alive) {
		// 	var pos = global.player.FootPos;
		// 	var start = [0,0,120 - 30];
		// 	global.player.Setup(start);
		// 	global.journal.unshift({
		// 		text: 'Arrived in Fareville',
		// 		dt: global.time
		// 	});
		// } else {
		// 	global.player.FootPos = this.character.FootPos;
		// }

		// this.move = [ -1, -0.98 * 4, 0 ];
		// this.vec3.Set(this.move[0], this.move[1], this.move[2]);
		// OP.physXController.Move(this.character.controller, this.vec3, timer);


	},

	Interact: function() {
        return null;
		//return new Talk(this.character, 'What would you like?');
	}
};

module.exports = Taxi;
