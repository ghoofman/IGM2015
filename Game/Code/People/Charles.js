var OP = require('OPengine').OP;
var Talk = require('../Utils/Talk.js');

function Charles(character) {
	this.character = character;
	if(global.job && global.job == 'barista') {

	  	OP.physXController.SetFootPos(this.character.controller, 1000, 0, 1000);

	}
}

Charles.prototype = {
	Update: function() {

	},

	Interact: function() {
        return new Talk(this.character, 'Want a job?', [ {
            text: 'Yes!', select: function() {
				global.job = 'barista';
			}
        }, { text: "No way" } ]);
	}
};

module.exports = Charles;
