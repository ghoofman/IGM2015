var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('./../Utils/JSON.js');

function Charles(character) {
	this.character = character;
	global.charles = {};
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.job && global.job.title == 'barista') {
		this.character.dead = true;
		this.character.alive = false;
		return;
	}

	this.state = 'FIND_REGISTER';
	this.target = null;

	this.base = new BaseAI(this);
}

Charles.prototype = {
	interactions: [],

	Update: function(timer, scene) {

		if(this.character.dead) {
			console.log('CHARLES IS DEAD');
			return;
		} else {
			console.log('CHARLES IS ALIVE');
		}

		if(!this.character.alive && (!global.job || global.job.title != 'barista')) {
			console.log('SHOULD SPAWN');
			if((!global.job || global.job.title != 'barista')) {
				var start = this.character.scene.FindPosition(3);
				this.character.Setup(null);
			} else {
				console.log('DID NOT SPAWN');
			}
			return;
		} else {
			console.log('DO NOT SPAWN', this.character.alive, global.job );
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
		if(global.job == 'barista') {
			return new Talk(this.character, 'Go around back and you can take over');
		}
		var self = this;

		function CoffeeSelectResult() {
			return new Talk(self.character, 'Coming right up');
		}

		function CoffeeSelect(id) {
			return new Talk(self.character, 'What kind of coffee?', [ {
				text: 'Regular',
				select: CoffeeSelectResult
			}, {
				text: 'Bold',
				select: CoffeeSelectResult
			}, {
				text: 'Decaf',
				select: CoffeeSelectResult
			}]);
		}


		function CupSelect() {
			return new Talk(self.character, 'What size coffee?', [ {
				text: 'Short',
				select: CoffeeSelect
			}, {
				text: 'Tall',
				select: CoffeeSelect
			}, {
				text: 'Grande',
				select: CoffeeSelect
			}]);
		}

		global.AudioPlayer.PlayEffect('Audio/Speak.wav');

        return new Talk(this.character, 'What would you like?', [
			{ text: "A cup of coffee", select: CupSelect  },
			{
				text: 'A job please', select: function() {
					var key = JSON('Scenes/Items/CafeKey.json');
					global.inventory.Add(key.key, key.data);
					global.job = {
						title: 'barista',
						rate: 8,
						time: 0,
						clocked: false
					};

                    global.tasks.push( {
                		text: 'Get to work',
                		complete: function() { return global.sceneName == 'Cafe' && global.sceneEntered == 3; },
                		time: -1000
                	});

					self.done = true;
					self.state = 'FIND_EXIT';
					return new Talk(self.character, "You got it! I quit, here's the key to the back door. Enjoy.");
				}
        	}
		]);
	}
};

module.exports = Charles;
