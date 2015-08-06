var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('./../Utils/JSON.js');

function Charles(character) {
	this.character = character;
	global.charles = {};
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name == 'Street' && global.win) {
		var start = this.character.scene.FindPosition(100);
		this.character.Setup(start);
		this.Update = this.UpdateWin;
		this.Interact = this.InteractWin;
	} else if(global.currentScene.name == 'Street' && (global.job && global.job.title == 'barista')) {
		var start = this.character.scene.FindPosition(400);
		this.character.Setup(start);
		this.Update = this.UpdateStreet;
		this.Interact = this.InteractStreet;
		this.character.rotate = -3.14 / 2.0;
	} else {
		if((global.job && global.job.title == 'barista') ||
			global.currentScene.name != 'Cafe' ) {
			this.character.dead = true;
			this.character.alive = false;
			return;
		}
		this.Update = this.UpdateCafe;
		this.Interact = this.InteractCafe;
	}

	this.state = 'FIND_REGISTER';
	this.target = null;

	this.base = new BaseAI(this);
}

Charles.prototype = {
	interactions: [],

	UpdateWin: function(timer, scene) {
		this.character.rotate += 0.1;
	},

	UpdateStreet: function(timer, scene) {
		if(this.character.dead) {
			return;
		}
	},

	UpdateCafe: function(timer, scene) {

		console.log(this.state);

		if(this.character.dead) {
			return;
		}

		if(!this.character.alive && (!global.job || global.job.title != 'barista')) {
			if((!global.job || global.job.title != 'barista')) {
				var start = this.character.scene.FindPosition(4);
				this.character.Setup(start);
			}
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
			case 'REGISTER': {
				var collisions = scene.Collisions(this.character);
				console.log(collisions);
				for(var i = 0; i < collisions.length; i++) {
					if(collisions[i].type == 'register') {
						console.log(collisions[i]);
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

						for(var j = 0; j < this.interactions.length; j++){
							this.interactions[j].Leave && this.interactions[j].Leave(this.character);
							this.interactions.splice(j, 1);
							j--;
						}

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

	InteractWin: function() {
		var self = this;
		return new Talk(self.character, 'Yay. You win. Get back to work slacker.');
	},

	InteractStreet: function() {
		var self = this;
		return new Talk(self.character, 'Get to work I\'m on a "smoke" break.');
	},

	InteractCafe: function() {
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

					return new Talk(self.character, 'Does the 9am to 12pm schedule work for you?',
					[
						{ text: 'I\'ll take it!', select: function() {
							var key = JSON('Scenes/Items/CafeKey.json');
							global.inventory.Add(key.key, key.data);
							global.job = {
								title: 'barista',
								rate: 8,
								time: 0,
								clocked: false
							};

							global.job.schedule = [{
								start: 9,
								end: 12
							}];

		                    global.job.activeSchedule = global.job.schedule[0];

							if(global.job.activeSchedule.start - 1 > global.time.getHours() &&
								global.job.activeSchedule.start < global.time.getHours()) {

			                    global.tasks.push( {
			                		text: 'Get to work',
			                		complete: function() { return global.job && global.job.clocked; },
			                		failed: function() { return !global.job; },
									time: -1000
			                	});
							}

							global.journal.unshift({
								text: 'Got a job at Cup a Joe',
								dt: global.time
							});

							self.done = true;
							self.state = 'FIND_EXIT';
							return new Talk(self.character, [ "You got the job! Here's the key to the back door,", "you can start tomorrow morning."]);
						 }
					 	},
						{ text: 'No thanks.' }
					]
					);
				}
        	}
		]);
	}
};

module.exports = Charles;
