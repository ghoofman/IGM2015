var OP = require('OPengine').OP;

function InventoryViewer() {

}

InventoryViewer.prototype = {
	Update: function(timer, gamepad) {

		if(OP.keyboard.WasPressed(OP.KEY.ENTER) || OP.keyboard.WasPressed(OP.KEY.E) || gamepad.WasPressed(OP.gamePad.Y)) {
			return {
				result: 1
			}
		}

		return {
			result: 0
		};
	},

	Draw: function() {

	},

	Exit: function() {

	}
};

module.exports = function() {
	return new InventoryViewer();
}
