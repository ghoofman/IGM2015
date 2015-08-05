var OP = require('OPengine').OP;
var Input = require('../Utils/Input.js');

function GameOver(scene, message) {
    this.scene = scene;
    this.fontManager72 = OP.fontManager.Setup('pixel72.opf');
    this.fontManager24 = OP.fontManager.Setup('pixel24.opf');
	this.size = OP.render.Size();
    this.message = message;
}

GameOver.prototype = {

	Update: function(timer, gamepad) {
        if(Input.WasActionPressed(gamepad) || Input.WasBackPressed(gamepad)) {
			return {
				result: -2
			};
		}

		return {
			result: 0
		};
	},

	Draw: function() {

        // Draw background fade
		OP.render.Clear(0,0,0);

        OP.fontRender.Begin(this.fontManager72);
        this.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(1.0, 1.0, 1.0);
        OP.fontRender('Game Over', this.size.ScaledWidth / 2.0, -100 + this.size.ScaledHeight / 2.0);
        OP.fontRender.End();

        OP.fontRender.Begin(this.fontManager24);
        this.fontManager24.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(1.0, 1.0, 1.0);
        if(this.message) {
            for(var i = 0; i < this.message.length; i++) {
                OP.fontRender(this.message[i], this.size.ScaledWidth / 2.0, 30 * i + this.size.ScaledHeight / 2.0);
            }
        } else {
            OP.fontRender('You\'re out of money.', this.size.ScaledWidth / 2.0, this.size.ScaledHeight / 2.0);
            OP.fontRender('Looks like you\'ll be living in your parents basement from now on.', this.size.ScaledWidth / 2.0, 30 + this.size.ScaledHeight / 2.0);
        }
        OP.fontRender.End();

	},

	Exit: function() {

	}

};

module.exports = function(scene, message) {
	return new GameOver(scene, message);
}
