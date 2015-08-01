var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('../Utils/JSON.js');

function Chelsea(character) {
	this.character = character;
	global.Chelsea = {};
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name != 'GLOBAL' ) {
		this.character.dead = true;
		this.character.alive = false;
		return;
	}

	this.state = 'FIND_REGISTER';
	this.target = null;

	this.base = new BaseAI(this);
}

Chelsea.prototype = {
	interactions: [],

	Update: function(timer, scene) {

		if(this.character.dead) return;

		if(!this.character.alive) {
			var start = this.character.scene.FindPosition(3);
			this.character.Setup(start);
			this.character.rotate = -3.14 / 2.0;
			return;
		}

		if(!this.character.alive) {
			return;
		}

		this.base.Move(timer);

		switch(this.state) {
			case 'EXIT': {
				var collisions = scene.Collisions(this.character);
				for(var i = 0; i < collisions.length; i++) {
					if(collisions[i].type == 'door') {
						this.target = null;
						this.character.dead = 1;
						for(var i = 0; i < this.interactions.length; i++){
							this.interactions[i].Leave && this.interactions[i].Leave(this.character);
							this.interactions.splice(i, 1);
							i--;
						}
						OP.physXScene.Remove(this.character.physXScene, this.character.controller.actor);
					}
				}
				break;
			}
			case 'REGISTER': {
				var collisions = scene.Collisions(this.character);
				for(var i = 0; i < collisions.length; i++) {
					if(collisions[i].type == 'register') {

						if(collisions[i].Entity) {
							collisions[i].Entity.CharacterInteract &&
								collisions[i].Entity.CharacterInteract(this.character, collisions[i]);
								this.interactions.push(collisions[i].Entity);
						}

						this.target = null;
						this.state = null;
					}
				}
				break;
			}
			case 'FIND_EXIT': {
				var doors = scene.FindType('door');
				for(var i = 0; i < doors.length; i++) {
					if(doors[i].data && !doors[i].data.customer) {
						this.target = doors[i].position;
						this.state = 'EXIT';
						break;
					}
				}
				break;
			}
			case 'FIND_REGISTER': {
				this.state = 'REGISTER';
				var registers = scene.FindType('register');
				for(var i = 0; i < registers.length; i++) {
					if(!registers[i].data || !registers[i].data.customer) {
						this.target = registers[i].position;
						break;
					}
				}
				break;
			}
			case 'WANDER': {
				if(!this.target) {
					this.state = null;
				}
				break;
			}
			default: {

				break;
			}
		}

	},

	Interact: function() {
		var self = this;

		//global.AudioPlayer.PlayEffect('Audio/Speak.wav');

		if(global.inventory.Has('global-apartment-key-1-c')) {
			return new Talk(this.character, 'If there\'s anything I can do to help, let me know.');
		}

        return new Talk(this.character, 'What would you like?', [
			{ text: 'Nothing', select: function() {  } },
			{ text: "A room please.", select: function() {
					return new Talk(self.character, "It requires a $30 deposit and costs $6 / day. Does that work?", [
						{ text: "I'll take it.", select: function() {

							global.wallet.AddExpense('Apartment Deposit', 'rent', 30);

								var key = JSON('Scenes/Items/GLOBAL1CKey.json');
								global.inventory.Add(key.key, key.data);

								global.apartment = {
									rent: 6,
									room: '1C'
								};

								global.journal.unshift({
									text: 'Got a room at GLOBAL Apartments',
									dt: global.time
								});

								return new Talk(self.character, "Very well, you can take apartment 1C. It's just up the stairs.");
							}
						},
						{ text: "Nevermind", select: function() { }  },

					]);
				}
        	}
		]);
	}
};

module.exports = Chelsea;
