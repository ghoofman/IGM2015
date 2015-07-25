var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');

function Frank(character) {
	this.character = character;
	this.vec3 = OP.vec3.Create(0,0,0);


	if(!global.ai.frank) {
		global.ai.frank = { };
	}

	this.base = new BaseAI(this);
}

Frank.prototype = {

	interactions : [],

	Update: function(timer, scene) {

		if(this.character.dead) return;

		if(!this.character.alive && !global.ai.frank.receivedCoffee) {
			if(global.job && global.job.title == 'barista' && Math.random() < 0.01) {
				var start = this.character.scene.FindPosition(2);
				this.character.Setup(start);
			}
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
			case 'FIND': {
				var collisions = scene.Collisions(this.character);
				for(var i = 0; i < collisions.length; i++) {
					if(collisions[i].type == 'register' && collisions[i].data && collisions[i].data.customer) {
						console.log('GETTING COFFEE', collisions[i]);

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
				if(global.ai.frank.receivedCoffee) {
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
					console.log('Finding registers');
					// choose the customer side
					for(var i = 0; i < registers.length; i++) {
						if(registers[i].data && registers[i].data.customer) {
							this.target = registers[i].position;
							break;
						}
					}
				}
			}
		}
	},

	Interact: function() {
		//global.AudioPlayer.PlayEffect('Audio/Speak2.wav');

		if(!global.job || global.job.title != 'barista') {
            return new Talk(this.character, "Sup' dude.");
		}

        if(global.ai.frank.receivedCoffee) {
            return new Talk(this.character, "I'm all set for now. Thanks.");
        }

		var cup = global.inventory.Get('cup');
		console.log('CUP', cup);

        if(cup && cup.coffee
              && cup.type == 'Tall'
              && cup.coffee.type == 'Bold') {

          	var self = this;

            if(!global.ai.frank.talked) {
                   return new Talk(this.character, 'Dude! How did you know? You psychic?', [ {
                       text: "Shhh don't tell anyone"
                   }, { text: "I just know these things" } ], function() {
					   	global.inventory.Remove('cup');
						global.wallet.AddIncome('Tip from Frank', 'tip', 4);
	            		global.AudioPlayer.PlayEffect('Audio/Money.wav');
                       	global.ai.frank.receivedCoffee = true;

						for(var i = 0; i < self.interactions.length; i++){
							self.interactions[i].Leave && self.interactions[i].Leave(self.character);
							self.interactions.splice(i, 1);
							i--;
						}
						self.character.atRegister = false;
                   });
            }

            return new Talk(this.character, 'Thanks bro-ski', null, function() {
				global.inventory.Remove('cup');
				global.wallet.AddIncome('Tip from Frank', 'tip', 2);
	            global.AudioPlayer.PlayEffect('Audio/Money.wav');
                global.ai.frank.receivedCoffee = true;
				self.character.atRegister = false;

				for(var i = 0; i < self.interactions.length; i++){
					self.interactions[i].Leave && self.interactions[i].Leave(self.character);
					self.interactions.splice(i, 1);
					i--;
				}
            });
        }

        if(cup && cup.coffee && (cup.type != 'Tall' || cup.coffee.type != 'Bold')) {
                if(global.ai.frank.talked) {
                    return new Talk(this.character, 'Not what I asked for... I want a Tall Bold Coffee.');
                } else {
                    global.ai.frank.talked = true;
                    return new Talk(this.character, 'I want a Tall Bold Coffee... Not this...');
                }
        }

		if(global.ai.frank.talked) {
			return new Talk(this.character, "How's that Tall Bold Coffee coming?");
		}

        global.ai.frank.talked = true;

        return new Talk(this.character, 'I want a Tall Bold Coffee. Right Now', [ {
        	text: 'You got it', select: function() {

                global.tasks.push( {
            		text: 'Get Frank a Tall Bold Coffee',
            		complete: function() { return global.ai.frank.receivedCoffee; },
            		time: -1000
            	});
			}
        }, { text: "Can't do that right now" } ]);

        return null;
	},

	EndOfDay: function() {
		global.ai.frank.receivedCoffee = false;
		global.ai.frank.talked = false;
	}
};

module.exports = Frank;
