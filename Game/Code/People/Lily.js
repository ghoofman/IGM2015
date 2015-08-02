var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');

function Lily(character) {
	this.character = character;
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name != 'Cafe' ) {
		this.character.dead = true;
		this.character.alive = false;
		return;
	}

	this.character.alive = 0;
	if(!global.ai.lily) {
		global.ai.lily = { };
	}

	if(!global.memory.lily) {
		global.memory.lily = {};
	}

	this.base = new BaseAI(this);
}

Lily.prototype = {

	interactions : [],

	Update: function(timer, scene) {

		if(this.character.dead) return;

		// Lily comes into the cafe at 9am
		if(!this.character.alive && !global.ai.lily.receivedCoffee && global.time.getHours() == 9) {
			if(global.job && global.job.title == 'barista' && global.job.clocked && (Math.random() < 0.01) || global.time.getMinutes() == 59) {
				var start = this.character.scene.FindPosition(2);
				this.character.Setup(start);
			}
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
						this.character.alive = 0;

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
			case 'FIND': {
				// If someone is already at the register, just wander around
				if(this.targetObj && this.targetObj.Entity.customer != null) {
					this.state = 'WANDER';

					var x = this.character.FootPos.x + -50 + Math.random() * 100;
					var z = this.character.FootPos.z + -50 + Math.random() * 100;
					this.target = [ x, 0, z ];
					break;
				}
				var collisions = scene.Collisions(this.character);
				for(var i = 0; i < collisions.length; i++) {
					if(collisions[i].type == 'register' && collisions[i].data && collisions[i].data.customer) {

						if(collisions[i].Entity) {
							collisions[i].Entity.CharacterInteract &&
								collisions[i].Entity.CharacterInteract(this.character, collisions[i]);

							this.interactions.push(collisions[i].Entity);
						}

						this.target = null;
						this.character.atRegister = 1;
						this.state = 'GETTING COFEE';
						break;
					}
				}
				// Not colliding with a register right now

				break;
			}
			case 'GETTING COFEE': {
				if(global.ai.lily.receivedCoffee) {
					var registers = scene.FindType('door');
					if(registers.length > 0) {
						this.target = registers[0].position;
						this.state = 'EXIT';
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
				if(!this.target && !this.character.atRegister) {
					var registers = scene.FindType('register');
					this.state = 'FIND';
					// choose the customer side
					var found = false;
					for(var i = 0; i < registers.length; i++) {
						if(registers[i].data && registers[i].data.customer && !registers[i].Entity.customer) {
							this.target = registers[i].position;
							this.targetObj = registers[i];
							found = true;
							break;
						}
					}

					if(found) break;

					// If we made it here, we didn't find a register
					this.state = 'WANDER';

					var x = this.character.FootPos.x + -50 + Math.random() * 100;
					var z = this.character.FootPos.z + -50 + Math.random() * 100;
					this.target = [ x, 0, z ];
				}
			}
		}
	},

	Interact: function() {
		//global.AudioPlayer.PlayEffect('Audio/Speak2.wav');

		if(!global.job || global.job.title != 'barista') {
            return new Talk(this.character, "Hello");
		}

        if(global.ai.lily.receivedCoffee) {
            return new Talk(this.character, "I'm all set for now. Thanks.");
        }

		var cup = global.inventory.Get('cup');

        if(cup && cup.coffee
              && cup.type == 'Grande'
              && cup.coffee.type == 'Regular') {

          	var self = this;

            if(!global.ai.lily.talked) {
				if(global.memory.lily && global.memory.lily.regular) {
                   return new Talk(this.character, 'Aww you remembered what I like :)', [
					   { text: "Could I get your number?" },
					   { text: "It\'s an easy one to remember." } ], function() {
						   	global.inventory.Remove('cup');
							global.wallet.AddIncome('Tip from Lily', 'tip', 4);
		            		global.AudioPlayer.PlayEffect('Audio/Money.wav');
	                       	global.ai.lily.receivedCoffee = true;

							for(var i = 0; i < self.interactions.length; i++){
								self.interactions[i].Leave && self.interactions[i].Leave(self.character);
								self.interactions.splice(i, 1);
								i--;
							}
							self.character.atRegister = false;
					   });
				} else {
                   return new Talk(this.character, 'How did you know?', [
					   { text: "Just a good guess" } ], function() {
					   global.memory.lily.regular = true;
					   	global.inventory.Remove('cup');
						global.wallet.AddIncome('Tip from Lily', 'tip', 4);
	            		global.AudioPlayer.PlayEffect('Audio/Money.wav');
                       	global.ai.lily.receivedCoffee = true;

						for(var i = 0; i < self.interactions.length; i++){
							self.interactions[i].Leave && self.interactions[i].Leave(self.character);
							self.interactions.splice(i, 1);
							i--;
						}
						self.character.atRegister = false;
                   });
			   }
            }

            return new Talk(this.character, 'Thank you! >3', null, function() {

				global.memory.lily.regular = true;
				global.inventory.Remove('cup');
				global.wallet.AddIncome('Tip from Lily', 'tip', 2);
	            global.AudioPlayer.PlayEffect('Audio/Money.wav');
                global.ai.lily.receivedCoffee = true;
				self.character.atRegister = false;

				for(var i = 0; i < self.interactions.length; i++){
					self.interactions[i].Leave && self.interactions[i].Leave(self.character);
					self.interactions.splice(i, 1);
					i--;
				}
            });
        }

        if(cup && cup.coffee && (cup.type != 'Grande' || cup.coffee.type != 'Regular')) {
                if(global.ai.lily.talked) {
                    return new Talk(this.character, 'Not what I asked for... I want a Grande Regular Coffee.');
                } else {
                    global.ai.lily.talked = true;
                    return new Talk(this.character, 'I want a Grande Regular Coffee... Not this...');
                }
        }

		if(global.ai.lily.talked) {
			return new Talk(this.character, "How's that Grande Regular Coffee coming?");
		}

        global.ai.lily.talked = true;

        return new Talk(this.character, 'Could I please have a Grande Regular Coffee?', [ {
        	text: 'You got it', select: function() {

                global.tasks.push( {
            		text: 'Get Lily a Grande Regular Coffee',
            		complete: function() { return global.ai.lily.receivedCoffee; },
            		time: -1000
            	});
			}
        }, { text: "Can't do that right now" } ]);

        return null;
	},

	EndOfDay: function() {
		if(global.ai && global.ai.lily) {
			global.ai.lily.receivedCoffee = false;
			global.ai.lily.talked = false;
		}
	}
};

module.exports = Lily;
