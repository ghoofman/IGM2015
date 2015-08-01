var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');

function Johnny(character) {
	this.character = character;
	this.vec3 = OP.vec3.Create(0,0,0);


	if(global.currentScene.name != 'Cafe' ) {
		this.character.dead = true;
		this.character.alive = false;
		return;
	}

	if(!global.ai.johnny) {
		global.ai.johnny = { };
	}
	this.character.alive = 0;

	this.base = new BaseAI(this);
}

Johnny.prototype = {

	interactions : [],

	Update: function(timer, scene) {

		if(this.character.dead) return;

		// Johnny comes into the cafe at 10
		if(!this.character.alive && !global.ai.johnny.receivedCoffee && global.time.getHours() == 10) {
			if(global.job && global.job.title == 'barista' && global.job.clocked && Math.random() < 0.01) {
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
				if(global.ai.johnny.receivedCoffee) {
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

        if(global.ai.johnny.receivedCoffee) {
            return new Talk(this.character, "I'm all set for now. Thanks.");
        }

		var cup = global.inventory.Get('cup');

        if(cup && cup.coffee
              && cup.type == 'Grande'
              && cup.coffee.type == 'Bold') {

          	var self = this;

            if(!global.ai.johnny.talked) {
				if(global.memory.johnny && global.memory.johnny.regular) {

				} else {
                   return new Talk(this.character, 'Whoa, good guess mate.',  null, function() {
					   	global.inventory.Remove('cup');
						global.wallet.AddIncome('Tip from Johnny', 'tip', 4);
	            		global.AudioPlayer.PlayEffect('Audio/Money.wav');
                       	global.ai.johnny.receivedCoffee = true;

						for(var i = 0; i < self.interactions.length; i++){
							self.interactions[i].Leave && self.interactions[i].Leave(self.character);
							self.interactions.splice(i, 1);
							i--;
						}
						self.character.atRegister = false;
                   });
			   }
            }

            return new Talk(this.character, 'Thanks mate', null, function() {
				global.inventory.Remove('cup');
				global.wallet.AddIncome('Tip from Johnny', 'tip', 2);
	            global.AudioPlayer.PlayEffect('Audio/Money.wav');
                global.ai.johnny.receivedCoffee = true;
				self.character.atRegister = false;

				for(var i = 0; i < self.interactions.length; i++){
					self.interactions[i].Leave && self.interactions[i].Leave(self.character);
					self.interactions.splice(i, 1);
					i--;
				}
            });
        }

        if(cup && cup.coffee && (cup.type != 'Grande' || cup.coffee.type != 'Bold')) {
                if(global.ai.johnny.talked) {
                    return new Talk(this.character, 'Not what I asked for mate.');
                } else {
                    global.ai.johnny.talked = true;
                    return new Talk(this.character, 'Not what I want mate. Could I get a Grande Bold Coffee instead?');
                }
        }

		if(global.ai.johnny.talked) {
			return new Talk(this.character, "How's that Grande Bold Coffee coming along mate?");
		}

        global.ai.johnny.talked = true;

        return new Talk(this.character, 'I\'d like a Grande Bold Coffee.', [ {
        	text: 'You got it', select: function() {

                global.tasks.push( {
            		text: 'Get Johnny a Grande Bold Coffee',
            		complete: function() { return global.ai.johnny.receivedCoffee; },
            		time: -1000
            	});
			}
        }, { text: "Can't do that right now" } ]);

        return null;
	},

	EndOfDay: function() {
		global.ai.johnny.receivedCoffee = false;
		global.ai.johnny.talked = false;
	}
};

module.exports = Johnny;
