var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('../Utils/JSON.js');

function Mom(character) {
	this.character = character;
	global.ai.mom = {};
	if(!global.memory.mom) {
		global.memory.mom = {};
	}

	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name == 'Street' && global.win) {
		var start = this.character.scene.FindPosition(107);
		this.character.Setup(start);
		this.Update = this.UpdateWin;
		this.Interact = this.InteractWin;
	} else if(global.currentScene.name == 'Street') {
		this.Update = this.UpdateStreet;
		this.Interact = this.InteractStreet;
	} else {
		if(global.currentScene.name != 'TaxiCab' ) {
			this.character.dead = true;
			this.character.alive = false;
			return;
		}
		this.Update = this.UpdateTaxi;
		this.Interact = this.InteractTaxi;
	}

	this.state = 'FIND_REGISTER';
	this.target = null;

	this.base = new BaseAI(this);

}

Mom.prototype = {
	interactions: [],

		UpdateWin: function(timer, scene) {
			this.character.rotate += 0.1;
		},
	UpdateTaxi: function(timer, scene) {

			if(global.win) {
				this.character.rotate += 0.1;
				return;
			}
		if(this.character.dead) return;


	},

	UpdateStreet: function(timer, scene) {
		if(this.Interact) {
			global.currentScene.Data.game = this.Interact();
		}
	},

	CoreyIsSuccessful: function() {
		return new Talk(this.character, ['He\'s the Vice-President of GenCo-Electronics now!', 'I hope your job as a ' + global.job.title + ' is everything you hoped...']);
	},

	TalkAboutCorey: function() {
		var self = this;
		return new Talk(this.character, 'Did you hear about Corey?', [
			{ text: '( lie ) Yes mom, I\'m on FaceNovel too.', select: function() {
				return self.CoreyIsSuccessful();
			}},
			{ text: '( truth ) Nope, what about him?', select: function() {
				return self.CoreyIsSuccessful();
			}},
		]);
	},

	MakePhoneCall: function(target) {
		return new Talk(this.character, 'Mom is calling', [
			{ text: 'Answer it', select: function() {
				return target();
				}
			},
			{ text: 'Decline' }
		]);
	},

	InteractStreet: function() {
		var self = this;

		if(!global.memory.mom.chatter && global.job && global.job.clockedAtLeastOnce && Math.random() > 0.98) {
			global.memory.mom.chatter = true;
			return this.MakePhoneCall(function() {
				return self.TalkAboutCorey()
			});
		}
	},

	InteractTaxi: function() {
		var self = this;

        return new Talk(this.character, ['Oh Timmy, you finally graduated. It took you longer', 'than it should have, but you did it all the same.'], null, function() {
			return new Talk(self.character, 'Do you have a place to live yet?', [ {
				text: '( truth ) Not yet.',
				select: function() {
					return new Talk(self.character, ['Timmy! I looked online, you\'re not in the safest neighborhood.', 'Promise me you\'ll do that first thing!'], [
						{
							text: 'Yes mom...',
							select: function() {
								global.tasks.push({
									text: 'Find an Apartment',
									complete: function() {
										return global.inventory.Has('apartment-key') ||
											global.inventory.Has('global-apartment-key-1-c');
									},
									time: -1000
								});
								global.ai.mom.finishedTalking = true;
							}
						}
					]);
				}
			},{
				text: '( lie ) Yep... all set mom.',
				select: function() {
					global.journal.unshift({
						text: 'Lied to mom about having an apartment',
						dt: global.time
					});
					global.tasks.push({
						text: 'Find an Apartment',
						complete: function() {
							return global.inventory.Has('apartment-key') ||
								global.inventory.Has('global-apartment-key-1-c');
						},
						time: -1000
					});
					global.ai.mom.finishedTalking = true;
				}
			} ]);
		});
	},

	InteractWin: function() {
		var self = this;
		return new Talk(self.character, 'Oh hun, I\'m so proud of you.');
	}
};

module.exports = Mom;
