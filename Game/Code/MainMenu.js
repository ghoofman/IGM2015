var OP = require('OPengine').OP,
	OPgameState = require('OPgameState'),
	Input = require('./Utils/Input.js'),
	SceneCreator = require('./SceneCreator.js'),
	BuildVoxelMesh = require('./Utils/BuildVoxelMesh.js'),
	Camera = require('./Utils/Camera.js');


function MainMenu() {
}

MainMenu.prototype = {
	Data: {},

	Initialize: function() {
		this.Data.gamePad0 = OP.gamePad.Get(0);
		this.Data.fontManager = OP.fontManager.Setup('pixel72.opf');
		this.Data.fontManager36 = OP.fontManager.Setup('pixel36.opf');

	    this.mesh = BuildVoxelMesh('PersonGraduated.qb');
	    this.model = OP.model.Create(this.mesh);

		// The basic effect to use for all rendering (for now)
		this.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', this.mesh.VertexSize);

		// The base material to use for all rendering (for now)
		this.material = OP.material.Create(this.effect);

		// The free flight camera
		this.camera = new Camera();


		this.camera.Look([-125, 150, 350], [ -125,0,0]);


		return 1;
	},

	Update: function(timer) {

		if(Input.WasActionPressed(this.Data.gamePad0)) {
			//global.win = true;
			var scene = new SceneCreator('/Scenes/TaxiCab.json', 1);
			//var scene = new SceneCreator('/Scenes/Street.json', 1);
			//var scene = new SceneCreator('/Scenes/GroceryStore.json', 1);
			//var scene = new SceneCreator('/Scenes/Dumpster.json', 1);
			//var scene = new SceneCreator('/Scenes/GLOBAL.json', 1);
			//var scene = new SceneCreator('/Scenes/GLOBALBedroom.json', 1);
			OPgameState.Change(scene);
			return 0;
		}

		OP.render.Clear(0.3,0.3,0.3);

		this.model.world.SetScl(3);
		this.model.world.RotY(-0.5);
		//this.model.world.Translate(0, 0, 0);
		OP.model.Draw(this.model, this.material, this.camera.Camera());

		OP.fontRender.Begin(this.Data.fontManager);
		this.Data.fontManager.SetAlign(OP.FONTALIGN.LEFT);
		OP.fontRender.Color(1.0, 1.0, 1.0);
		OP.fontRender("Degree", 200, 275);
		OP.fontRender.End();
		OP.fontRender.Begin(this.Data.fontManager36);
		this.Data.fontManager36.SetAlign(OP.FONTALIGN.LEFT);
		OP.fontRender.Color(0, 0.8, 0);
		OP.fontRender("<", 220, 375);
		OP.fontRender("Start Game", 250, 375);
		OP.fontRender.End();



		OP.render.Present();

		return 0;
	},

	Exit: function() {
		return 1;
	}
};

module.exports = MainMenu;
