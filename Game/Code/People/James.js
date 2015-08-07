var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('../Utils/JSON.js');

function James(character) {
	this.character = character;
	global.james = {};
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name == 'Street' && global.win) {
		var start = this.character.scene.FindPosition(104);
		this.character.Setup(start);
		this.Update = this.UpdateWin;
		this.Interact = this.InteractWin;
	} else {

		if(global.currentScene.name != 'VillageApartments' ) {
			this.character.dead = true;
			this.character.alive = false;
			return;
		}
		this.Update = this.UpdateApartment;
		this.Interact = this.InteractApartment;
	}

	this.state = 'FIND_REGISTER';
	this.target = null;

	this.base = new BaseAI(this);
}

James.prototype = {
	interactions: [],

	UpdateWin: function(timer, scene) {
		this.character.rotate += 0.1;
	},
	UpdateApartment: function(timer, scene) {

			if(global.win) {
				this.character.rotate += 0.1;
				return;
			}
		if(this.character.dead) return;

		if(!this.character.alive) {
			var start = this.character.scene.FindPosition(3);
			this.character.Setup(start);
			return;
		}

		if(!this.character.alive) {
			return;
		}

		this.base.Move(timer, true);

		switch(this.state) {
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
			default: {

				break;
			}
		}

	},

	InteractApartment: function() {
		var self = this;

		global.AudioPlayer.PlayEffect('Audio/Speak.wav');

		if(global.inventory.Has('apartment-key')) {
			return new Talk(this.character, 'If there\'s anything I can do to help, let me know.', [
				{ text: 'I\'d like to give up my apartment', select: function() {
					if(global.apartment) {
						global.wallet.AddIncome('Apartment Deposit', 'rent', global.apartment.deposit);
						global.inventory.Remove('apartment-key');
						for(var i = 0; i < global.apartments.length; i++) {
							if(global.apartments[i].key == 'apartment-key') {
								global.apartments.splice(i, 1);
								break;
							}
						}
					}
					return new Talk(self.character, 'Very well, thank you for the key. Have a nice day!');
				}},{ text: 'Nothing for now'}
			]);
		}

        return new Talk(this.character, 'What would you like?', [
			{ text: 'Nothing', select: function() {  } },
			{ text: "A room please.", select: function() {
					return new Talk(self.character, "It requires an $80 deposit and costs $15 / day. Does that work?", [
						{ text: "I'll take it.", select: function() {

							global.wallet.AddExpense('Village Apartment Deposit', 'rent', 80);

								var key = JSON('Scenes/Items/Apartment3Key.json');
								global.inventory.Add(key.key, key.data);

								global.apartments.push({
									name: 'Village',
									rent: 15,
									room: 3,
									deposit: 80,
									key: 'apartment-key'
								});

								global.journal.unshift({
									text: 'Got Apartment 3 at Village Apartments',
									dt: global.time
								});

								return new Talk(self.character, "Very well, you can take Apartment 3");
							}
						},
						{ text: "Nevermind", select: function() { }  },

					]);
				}
        	}
		]);
	},

	InteractWin: function() {
		var self = this;
		return new Talk(self.character, '...');
	}
};

module.exports = James;
