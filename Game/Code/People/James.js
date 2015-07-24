var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');

function James(character) {
	this.character = character;
	global.james = {};
	this.vec3 = OP.vec3.Create(0,0,0);

	this.state = 'FIND_REGISTER';
	this.target = null;

	this.base = new BaseAI(this);
}

James.prototype = {
	interactions: [],

	Update: function(timer, scene) {

		if(this.character.dead) return;

		if(!this.character.alive) {
			var start = this.character.scene.FindPosition(3);
			this.character.Setup(start);
			return;
		}

		if(!this.character.alive) {
			return;
		}

		this.base.Move(timer);

		console.log(this.state);
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

						console.log('Found the register');
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
				console.log('finding REGISTER');
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
					console.log('Wander no more');
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

		global.AudioPlayer.PlayEffect('Audio/Speak.wav');

        return new Talk(this.character, 'What would you like?', [
			{ text: 'Nothing', select: function() {  } },
			{ text: "A room please.", select: function() {
					return new Talk(self.character, "It'll cost $10 / day. Does that work?", [
						{ text: "I'll take it.", select: function() {
								global.inventory.Add('apartment-key', {
									sheet: 'CoffeeSelector',
									item: 'Key-iso'
								});
								global.apartment = {
									rent: 10,
									room: 3
								};
								return new Talk(self.character, "Very well, you can take Apartment 3");
							}
						},
						{ text: "Nevermind", select: function() { }  },

					]);
				}
        	}
		]);
	}
};

module.exports = James;
