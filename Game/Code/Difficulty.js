var OP = require('OPengine').OP,
	OPgameState = require('OPgameState'),
	Input = require('./Utils/Input.js'),
	SceneCreator = require('./SceneCreator.js');

function Difficulty() {
	this.Data.game = require('./Games/DifficultySelector.js')();
	this.Data.gamePad0 = OP.gamePad.Get(0);
}

Difficulty.prototype = {
	Data: {},

	Initialize: function() {
		return 1;
	},

	Update: function(timer) {

		if(this.Data.game) {
			var result = this.Data.game.Update(timer, this.Data.gamePad0);
			if(result && result.result && this.Data.game.selectedSprite) {

				global.EndDay = this.Data.game.selectedSprite.day;

				var scene = new SceneCreator('/Scenes/TaxiCab.json', 1);
				//var scene = new SceneCreator('/Scenes/Street.json', 1);
				//var scene = new SceneCreator('/Scenes/Cafe.json', 1);
				//var scene = new SceneCreator('/Scenes/Apartment.json', 1);
				//var scene = new SceneCreator('/Scenes/GroceryStore.json', 1);
				//var scene = new SceneCreator('/Scenes/Dumpster.json', 1);
				//var scene = new SceneCreator('/Scenes/GLOBAL.json', 1);
				//var scene = new SceneCreator('/Scenes/GLOBALBedroom.json', 1);
				OPgameState.Change(scene);
			}
		}

		OP.render.Clear(0.3,0.3,0.3);

		this.Data.game.Draw();

		OP.render.Present();

		return 0;
	},

	Exit: function() {
		return 1;
	}
};

module.exports = Difficulty;
