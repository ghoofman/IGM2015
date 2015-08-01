var OP = require('OPengine').OP;
var Input = require('../../Utils/Input.js');
var DateAndTime = require('date-and-time');

function Journal(base) {
	this.base = base;
}

Journal.prototype = {
	text: 'Journal',

	render: function() {
		OP.fontRender.Begin(this.base.fontManager36);
		OP.fontRender.Color(1.0, 1.0, 1.0);

		this.base.fontManager36.SetAlign(OP.FONTALIGN.LEFT);
		for(var i = 0; i < global.journal.length; i++) {
			OP.fontRender(global.journal[i].text, (this.base.size.ScaledWidth / 2.0) - 150, 100 + i * 60);
		}
		OP.fontRender.End();

		OP.fontRender.Begin(this.base.fontManager24);
		this.base.fontManager24.SetAlign(OP.FONTALIGN.RIGHT);
		for(var i = 0; i < global.journal.length; i++) {
			OP.fontRender(DateAndTime.format(global.journal[i].dt,'E MMM DD YYYY'), (this.base.size.ScaledWidth / 2.0) - 170, 105 + i * 60);
			OP.fontRender(DateAndTime.format(global.journal[i].dt,'h:mm A'), (this.base.size.ScaledWidth / 2.0) - 170, 125 + i * 60);
		}
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

module.exports = Journal;
