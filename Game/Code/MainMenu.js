var OP = require('OPengine').OP,
	OPgameState = require('OPgameState'),
	Input = require('./Utils/Input.js'),
	SceneCreator = require('./SceneCreator.js'),
	Difficulty = require('./Difficulty.js'),
	BuildVoxelMesh = require('./Utils/BuildVoxelMesh.js'),
	Camera = require('./Utils/Camera.js');
	var Wallet = require('./Utils/Wallet.js');


function MainMenu() {
}

MainMenu.prototype = {
	Data: {},

	Initialize: function() {

			global.game = {
				money: 100000,
				cash: 10,
				target: 10,
				loans: 10
			};

			global.ai = { };
			global.memory = {};

			global.wallet = new Wallet();

			global.time = new Date();
			global.time.setHours(8);
			global.time.setMinutes(0);
			global.time.setSeconds(0);
			global.time.setMilliseconds(0);

			global.timeScale = 1000;

			global.tasks = [ ];

			global.journal = [ ];

			global.days = 1;
			global.EndDay = 8;
			global.announcement = null;
			// {
			// 	text: 'TEST',
			// 	time: 3000
			// };

			global.meshes = {};

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


			// global.tasks.push( {
			// 	text: 'Get to work',
			// 	location: function() {
			// 		if(global.currentScene.name == 'Street') {
			// 			return {
			// 				pos: [210, 40, -50],
			// 				startScale: 0.5,
			// 				scale: 1.0,
			// 				rotateY: 0,
			// 				rotateZ: 3.14 / 2.0
			// 			};
			// 		}
			// 		return null;
			// 	},
			// 	complete: function() {
			// 		return false;
			// 	}
			// });

		return 1;
	},

	Update: function(timer) {

		if(Input.WasActionPressed(this.Data.gamePad0)) {
			//global.win = true;
			global.spawned = true;
			var scene = new Difficulty();
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
