var OP = require('OPengine').OP;

module.exports = {

	WasActionPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.ENTER) || OP.keyboard.WasPressed(OP.KEY.E) || gamepad.WasPressed(OP.gamePad.Y) || gamepad.WasPressed(OP.gamePad.X);
	},

	WasBackPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.Q) || gamepad.WasPressed(OP.gamePad.B) || gamepad.WasPressed(OP.gamePad.BACK);
	},

	WasLeftPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.A) || OP.keyboard.WasPressed(OP.KEY.LEFT) || gamepad.WasPressed(OP.gamePad.DPAD_LEFT) || gamepad.LeftThumbNowLeft();
	},

	WasRightPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.D) || OP.keyboard.WasPressed(OP.KEY.RIGHT) || gamepad.WasPressed(OP.gamePad.DPAD_RIGHT) || gamepad.LeftThumbNowRight();
	}

};
