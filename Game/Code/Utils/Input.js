var OP = require('OPengine').OP;

module.exports = {

	WasActionPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.ENTER) || OP.keyboard.WasPressed(OP.KEY.E) || gamepad.WasPressed(OP.gamePad.A) || gamepad.WasPressed(OP.gamePad.X);
	},

	WasActionReleased: function(gamepad) {
		return OP.keyboard.WasReleased(OP.KEY.ENTER) || OP.keyboard.WasReleased(OP.KEY.E) || gamepad.WasReleased(OP.gamePad.A) || gamepad.WasReleased(OP.gamePad.X);
	},

	IsActionDown: function(gamepad) {
		return OP.keyboard.IsDown(OP.KEY.ENTER) || OP.keyboard.IsDown(OP.KEY.E) || gamepad.IsDown(OP.gamePad.A) || gamepad.IsDown(OP.gamePad.X);
	},

	WasBackPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.ESCAPE) || OP.keyboard.WasPressed(OP.KEY.Q) || gamepad.WasPressed(OP.gamePad.B) || gamepad.WasPressed(OP.gamePad.BACK) || OP.keyboard.WasPressed(OP.KEY.TAB);
	},

	WasBackReleased: function(gamepad) {
		return OP.keyboard.WasReleased(OP.KEY.ESCAPE) || OP.keyboard.WasReleased(OP.KEY.Q) || gamepad.WasReleased(OP.gamePad.B) || gamepad.WasReleased(OP.gamePad.BACK) || OP.keyboard.WasReleased(OP.KEY.TAB);
	},

	IsBackDown: function(gamepad) {
		return OP.keyboard.IsDown(OP.KEY.ESCAPE) || OP.keyboard.IsDown(OP.KEY.Q) || gamepad.IsDown(OP.gamePad.B) || gamepad.IsDown(OP.gamePad.BACK) || OP.keyboard.IsDown(OP.KEY.TAB);
	},

	WasLeftPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.A) || OP.keyboard.WasPressed(OP.KEY.LEFT) || gamepad.WasPressed(OP.gamePad.DPAD_LEFT) || gamepad.LeftThumbNowLeft();
	},

	WasRightPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.D) || OP.keyboard.WasPressed(OP.KEY.RIGHT) || gamepad.WasPressed(OP.gamePad.DPAD_RIGHT) || gamepad.LeftThumbNowRight();
	},

	WasDownPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.S) || OP.keyboard.WasPressed(OP.KEY.DOWN) || gamepad.WasPressed(OP.gamePad.DPAD_DOWN) || gamepad.LeftThumbNowDown();
	},

	WasUpPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.W) || OP.keyboard.WasPressed(OP.KEY.UP) || gamepad.WasPressed(OP.gamePad.DPAD_UP) || gamepad.LeftThumbNowUp();
	},

	WasJumpPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.SPACE) || gamepad.WasPressed(OP.gamePad.Y);
	},

	WasJumpReleased: function(gamepad) {
		return OP.keyboard.WasReleased(OP.KEY.SPACE) || gamepad.WasReleased(OP.gamePad.Y);
	},

	IsJumpDown: function(gamepad) {
		return OP.keyboard.IsDown(OP.KEY.SPACE) || gamepad.IsDown(OP.gamePad.Y);
	},

	WasSpeedPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.LSHIFT) || OP.keyboard.WasPressed(OP.KEY.Z) || gamepad.LeftTriggerWasPressed();
	},

	WasSpeedReleased: function(gamepad) {
		return OP.keyboard.WasReleased(OP.KEY.LSHIFT) || OP.keyboard.WasReleased(OP.KEY.Z) || gamepad.LeftTriggerWasReleased();
	},

	IsSpeedDown: function(gamepad) {
		return OP.keyboard.IsDown(OP.KEY.LSHIFT) || OP.keyboard.IsDown(OP.KEY.Z) || gamepad.LeftTriggerIsDown();
	},

	WasSlowPressed: function(gamepad) {
		return OP.keyboard.WasPressed(OP.KEY.RSHIFT) || OP.keyboard.WasPressed(OP.KEY.C) || gamepad.RightTriggerWasPressed();
	},

	WasSlowReleased: function(gamepad) {
		return OP.keyboard.WasReleased(OP.KEY.RSHIFT) || OP.keyboard.WasReleased(OP.KEY.C) || gamepad.RightTriggerWasReleased();
	},

	IsSlowDown: function(gamepad) {
		return OP.keyboard.IsDown(OP.KEY.RSHIFT) || OP.keyboard.IsDown(OP.KEY.C) || gamepad.RightTriggerIsDown();
	}

};
