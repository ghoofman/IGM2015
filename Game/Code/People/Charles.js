var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('./../Utils/JSON.js');
var OptionSelector = require('./../Utils/OptionSelector.js');

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

							var startingNow = true;
							var currentHour = global.time.getHours();
							var currentMinutes = global.time.getMinutes();
							if(global.job.activeSchedule &&
								global.job.activeSchedule.start > currentHour &&
								global.job.activeSchedule.end > currentHour)
							{
								// Give the player at least 15 minutes (game time) to get to work
								if((global.job.activeSchedule.start - 1) == currentHour && currentMinutes > 45) {
									startingNow = false;
								} else {

									global.tasks.push( {
										text: 'Get to work',
										location: function() {
											if(global.currentScene.name == 'Street') {
												return {
													pos: [210, 40, -50],
													startScale: 0.5,
													scale: 1.0,
													rotateY: 0,
													rotateZ: 0
												};
											}
				                            if(global.currentScene.name == 'Cafe' && !global.job.clocked) {
				                                return {
				                                    pos: [-180, 40, 0],
				                                    startScale: 0.5,
				                                    scale: 1.0,
				                                    rotateY: 0,
				                                    rotateZ: 3.14
				                                };
				                            }
											return null;
										},
										update: function() {
											if(global.job && global.job.clocked) return;

											// There is a job
											if(global.job && global.job.activeSchedule) {
												// Check if we've passed the start time
												if(global.time.getHours() >= global.job.activeSchedule.start) {
													global.job = null;
													global.inventory.Remove('cafe-key');


													var game = require('./GameOver.js');
													return {
														result: 2,
														next: game(global.currentScene, ['You couldn\'t even hold down a job.', 'Time to hide away in your parents basement for all of eternity.'])
													};
												}

												if(global.time.getHours() == global.job.activeSchedule.start - 1 &&
													global.time.getMinutes() == 50 && !this.alerted) {
														this.alerted = true;
														return {
															result: 1,
															next: new OptionSelector('If I don\'t hurry I\'m going to be late for work')
														};
												}

											}

											return {
												result: 0
											};
										},
										complete: function() { return global.job && global.job.clocked; },
										failed: function() { return !global.job; },
										time: -1000
									});
							}
						}

							global.journal.unshift({
								text: 'Got a job at Cup a Joe',
								dt: global.time
							});

							if(startingNow) {
								self.done = true;
								self.state = 'FIND_EXIT';
							}
							return new Talk(self.character, [ "You got the job! Here's the key to the back door,", "you can start " + (startingNow ? "right now" : "tomorrow morning.")], null, function() {
								return new Talk(self.character, ["By the way, if you remember someones order before", "talking to them, they tend to tip you better."]);
							});
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
