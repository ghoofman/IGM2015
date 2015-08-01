var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');
var BaseAI = require('./BaseAI.js');
var JSON = require('../Utils/JSON.js');

function Mom(character) {
	this.character = character;
	global.ai.mom = {};
	this.vec3 = OP.vec3.Create(0,0,0);

	if(global.currentScene.name != 'TaxiCab' ) {
		this.character.dead = true;
		this.character.alive = false;
		return;
	}

	this.state = 'FIND_REGISTER';
	this.target = null;

	this.base = new BaseAI(this);

}

Mom.prototype = {
	interactions: [],

	Update: function(timer, scene) {

		if(this.character.dead) return;


	},

	Interact: function() {
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
									complete: function() { return global.inventory.Has('apartment-key'); },
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
						complete: function() { return global.inventory.Has('apartment-key'); },
						time: -1000
					});
					global.ai.mom.finishedTalking = true;
				}
			} ]);
		});
	}
};

module.exports = Mom;
