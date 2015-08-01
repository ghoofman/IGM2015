var OP = require('OPengine').OP;
var Input = require('../../Utils/Input.js');
var DateAndTime = require('date-and-time');

function Quit(base) {
	this.base = base;
}

Quit.prototype = {
	text: 'Quit',

	render: function() {
		OP.fontRender.Begin(this.base.fontManager36);
		this.base.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
		OP.fontRender.Color(1.0, 1.0, 1.0);
		OP.fontRender('Are you sure you want to quit?', this.base.size.ScaledWidth / 2.0, -100 + this.base.size.ScaledHeight / 2.0);
		OP.fontRender.End();
		OP.fontRender.Begin(this.base.fontManager24);
		this.base.fontManager24.SetAlign(OP.FONTALIGN.CENTER);
		OP.fontRender.Color(1.0, 1.0, 1.0);
		OP.fontRender('( No progress will be saved )', this.base.size.ScaledWidth / 2.0, this.base.size.ScaledHeight / 2.0);
		OP.fontRender.End();
	},

	update: function(timer, gamepad) {
		if(Input.IsBackDown(gamepad)) {
			OP.spriteSystem.SetSprite(this.base.back, 4);
		} else {
			OP.spriteSystem.SetSprite(this.base.back, 5);
		}

		if(this.base.initialRelease && Input.WasBackReleased(gamepad)) {
			return { result: 1 };
		}

		if(Input.WasActionPressed(gamepad)) {
			return { result: -1 };
		} else if(Input.WasBackPressed(gamepad)) {
			return { result: 1 };
		}
		return { result: 0 };
	}
};

module.exports = Quit;
