var OP = require('OPengine').OP,
	OPgameState = require('OPgameState'),
	Input = require('./Utils/Input.js'),
	SceneCreator = require('./SceneCreator.js');

function MainMenu() {
}

MainMenu.prototype = {
	Data: {},

	Initialize: function() {
		this.Data.gamePad0 = OP.gamePad.Get(0);
		this.Data.fontManager = OP.fontManager.Setup('pixel.opf');
		this.Data.fontManager36 = OP.fontManager.Setup('pixel36.opf');
		return 1;
	},

	Update: function(timer) {
		if(Input.WasActionPressed(this.Data.gamePad0)) {
			//var scene = new SceneCreator('/Scenes/TaxiCab.json', 1);
			//var scene = new SceneCreator('/Scenes/Street.json', 1);
			//var scene = new SceneCreator('/Scenes/GLOBAL.json', 1);
			var scene = new SceneCreator('/Scenes/GLOBALBedroom.json', 1);
			OPgameState.Change(scene);
			return 0;
		}

		OP.render.Clear(0,0,0);

		OP.fontRender.Begin(this.Data.fontManager);
		this.Data.fontManager.SetAlign(OP.FONTALIGN.LEFT);
		OP.fontRender.Color(1.0, 1.0, 1.0);
		OP.fontRender("Main Menu", 100, 100);
		OP.fontRender.End();
		OP.fontRender.Begin(this.Data.fontManager36);
		this.Data.fontManager36.SetAlign(OP.FONTALIGN.LEFT);
		OP.fontRender.Color(0, 0.8, 0);
		OP.fontRender("<", 120, 150);
		OP.fontRender("Start", 150, 150);
		OP.fontRender.End();

		OP.render.Present();

		return 0;
	},

	Exit: function() {
		return 1;
	}
};

module.exports = MainMenu;
