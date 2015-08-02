var OP = require('OPengine').OP;
var Input = require('../../Utils/Input.js');
var DateAndTime = require('date-and-time');

function Controls(base) {
	this.base = base;
	this.state = 0;
}

Controls.prototype = {
	text: 'Controls',
	state: 0,

	render: function() {
		if(this.state == 0) {
			this.renderKeyboard();
		} else {
			this.renderGamepad();
		}
	},

	renderKeyboard: function() {
		OP.fontRender.Begin(this.base.fontManager36);


		this.base.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
		OP.fontRender.Color(1.0, 1.0, 1.0);
		OP.fontRender('> Keyboard <', this.base.size.ScaledWidth / 2.0, 100);

		this.base.fontManager36.SetAlign(OP.FONTALIGN.RIGHT);

		OP.fontRender.Color(0.0, 0.8, 0.0);
		OP.fontRender('Action', this.base.size.ScaledWidth / 2.0, 200);
		OP.fontRender('Back', this.base.size.ScaledWidth / 2.0, 250);
		OP.fontRender('Move', this.base.size.ScaledWidth / 2.0, 300);
		OP.fontRender('Jump', this.base.size.ScaledWidth / 2.0, 400);
		OP.fontRender('Time', this.base.size.ScaledWidth / 2.0, 450);

		OP.fontRender.Color(1.0, 1.0, 1.0);
		this.base.fontManager36.SetAlign(OP.FONTALIGN.LEFT);
		OP.fontRender('E', 20 + this.base.size.ScaledWidth / 2.0, 200);
		OP.fontRender('Q / Tab / Escape', 20 + this.base.size.ScaledWidth / 2.0, 250);
		OP.fontRender('W / A / S / D', 20 + this.base.size.ScaledWidth / 2.0, 300);
		OP.fontRender('Up / Down / Left / Right', 20 + this.base.size.ScaledWidth / 2.0, 350);
		OP.fontRender('Space', 20 + this.base.size.ScaledWidth / 2.0, 400);
		OP.fontRender('Left Shift', 20 + this.base.size.ScaledWidth / 2.0, 450);
		OP.fontRender('Right Shift', 20 + this.base.size.ScaledWidth / 2.0, 500);
		OP.fontRender.End();
	},

	renderGamepad: function() {
		OP.fontRender.Begin(this.base.fontManager36);

		this.base.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
		OP.fontRender.Color(1.0, 1.0, 1.0);
		OP.fontRender('> GamePad <', this.base.size.ScaledWidth / 2.0, 100);

		this.base.fontManager36.SetAlign(OP.FONTALIGN.RIGHT);

		OP.fontRender.Color(0.0, 0.8, 0.0);
		OP.fontRender('Action', this.base.size.ScaledWidth / 2.0, 200);
		OP.fontRender('Back', this.base.size.ScaledWidth / 2.0, 250);
		OP.fontRender('Move', this.base.size.ScaledWidth / 2.0, 300);
		OP.fontRender('Jump', this.base.size.ScaledWidth / 2.0, 400);
		OP.fontRender('Time', this.base.size.ScaledWidth / 2.0, 450);

		OP.fontRender.Color(1.0, 1.0, 1.0);
		this.base.fontManager36.SetAlign(OP.FONTALIGN.LEFT);
		OP.fontRender('A', 20 + this.base.size.ScaledWidth / 2.0, 200);
		OP.fontRender('B / Back', 20 + this.base.size.ScaledWidth / 2.0, 250);
		OP.fontRender('Left Stick', 20 + this.base.size.ScaledWidth / 2.0, 300);
		OP.fontRender('Up / Down / Left / Right', 20 + this.base.size.ScaledWidth / 2.0, 350);
		OP.fontRender('Y', 20 + this.base.size.ScaledWidth / 2.0, 400);
		OP.fontRender('Right Trigger', 20 + this.base.size.ScaledWidth / 2.0, 450);
		OP.fontRender.End();
	},

	update: function(timer, gamepad) {
		if(Input.IsActionDown(gamepad)) {
			OP.spriteSystem.SetSprite(this.base.btn, 4);
		} else {
			OP.spriteSystem.SetSprite(this.base.btn, 5);
		}

		if(this.base.initialRelease && Input.WasBackReleased(gamepad)) {
			return { result: 1 };
		}

        if(Input.WasLeftPressed(gamepad)) {
			this.state--;
			if(this.state < 0) this.state = 1;
			this.state = this.state % 2;
		}

        if(Input.WasRightPressed(gamepad)) {
			this.state++;
			this.state = this.state % 2;
		}

		if(Input.WasActionReleased(gamepad)) {
			this.state++;
			this.state = this.state % 2;
		}

		if(Input.WasBackPressed(gamepad)) {
			return { result: 1 };
		}
		return { result: 0 };
	}
};

module.exports = Controls;
