var OP = require('OPengine').OP;
var Input = require('../../Utils/Input.js');
var DateAndTime = require('date-and-time');

function Settings(base) {
	this.base = base;
}

Settings.prototype = {
	text: 'Settings',

	render: function() {
		OP.fontRender.Begin(this.base.fontManager36);
		this.base.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
		OP.fontRender.Color(1.0, 1.0, 1.0);
		OP.fontRender('Settings', this.base.size.ScaledWidth / 2.0, this.base.size.ScaledHeight / 2.0);
		OP.fontRender.End();
	},

	update: function(timer, gamepad) {
		if(Input.IsActionDown(gamepad)) {
			OP.spriteSystem.SetSprite(this.base.back, 4);
		} else {
			OP.spriteSystem.SetSprite(this.base.back, 5);
		}

		if(this.base.initialRelease && Input.WasBackReleased(gamepad)) {
			return { result: 1 };
		}

		if(Input.WasActionPressed(gamepad) || Input.WasBackPressed(gamepad)) {
			return { result: 1 };
		}
		return { result: 0 };
	}
};

module.exports = Settings;
