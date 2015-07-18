var Talk = require('../Utils/Talk.js');

function Frank(character) {
	this.character = character;
}

Frank.prototype = {
	Update: function() {

	},

	Interact: function() {
		if(global.job != 'barista') {
            return new Talk(this.character, "Sup' dude.");
		}

        if(this.receivedCoffee) {
            return new Talk(this.character, "I'm all set for now. Thanks.");
        }

        if(global.inventory
            && global.inventory.cup
              && global.inventory.cup.coffee
              && global.inventory.cup.type == 'Tall'
              && global.inventory.cup.coffee.type == 'Bold') {

          	var self = this;

            if(!this.talked) {
                   return new Talk(this.character, 'Dude! How did you know? You psychic?', [ {
                       text: "Shhh don't tell anyone"
                   }, { text: "I just know these things" } ], function() {
					   global.inventory.Remove(global.inventory.cup.sheet, global.inventory.cup.item);

                           global.inventory.cup = null;
               	           global.game.target = global.game.cash + 4;
                           self.receivedCoffee = true;
                   });
            }

            return new Talk(this.character, 'Thanks bro-ski', null, function() {
                global.inventory.cup = null;
    	        global.game.target = global.game.cash + 2;
                self.receivedCoffee = true;
            });
        }

        if(global.inventory
            && global.inventory.cup
              && global.inventory.cup.coffee
              && (global.inventory.cup.type != 'Tall'
                || global.inventory.cup.coffee.type != 'Bold')) {

                if(this.talked) {
                    return new Talk(this.character, 'Not what I asked for... I want a Tall Bold Coffee.');
                } else {
                    this.talked = true;
                    return new Talk(this.character, 'I want a Tall Bold Coffee... Not this...');
                }
        }

        this.talked = true;

        return new Talk(this.character, 'I want a Tall Bold Coffee. Right Now', [ {
            text: 'You got it'
        }, { text: "Can't do that right now" } ]);

        return null;
	}
};

module.exports = Frank;
