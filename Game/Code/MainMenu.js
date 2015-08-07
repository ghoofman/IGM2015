var OP = require('OPengine').OP,
	OPgameState = require('OPgameState'),
	Input = require('./Utils/Input.js'),
	SceneCreator = require('./SceneCreator.js'),
	Difficulty = require('./Difficulty.js'),
	BuildVoxelMesh = require('./Utils/BuildVoxelMesh.js'),
	Camera = require('./Utils/Camera.js');
	var Wallet = require('./Utils/Wallet.js');
	var Inventory = require('./Utils/Inventory.js');


function MainMenu() {
}

MainMenu.prototype = {
	Data: {
		selected: 0
	},

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
			global.time.setYear(2015);
			global.time.setMonth(5);
			global.time.setDate(1);
			global.time.setHours(8);
			global.time.setMinutes(0);
			global.time.setSeconds(0);
			global.time.setMilliseconds(0);

			global.timeScale = 1000;

			global.tasks = [ ];

			global.journal = [ ];
			global.spriteSystemFood = null;

			global.days = 1;
			global.EndDay = 8;
			global.announcement = null;

			global.hints = {};

			global.apartments = [];

			global.girlfriend = false;

			global.hint = {
				text: 'Hint: If you remember a person\'s order before talking to them, they\'ll tip you better',
				time: 50000
			};

			global.hunger = null;

			global.inventory = new Inventory();

			// {
			// 	text: 'TEST',
			// 	time: 3000
			// };

			global.meshes = {};

		this.Data.gamePad0 = OP.gamePad.Get(0);
		this.Data.fontManager = OP.fontManager.Setup('pixel72.opf');
		this.Data.fontManager36 = OP.fontManager.Setup('pixel36.opf');
		this.Data.fontManager24 = OP.fontManager.Setup('pixel24.opf');

	    this.mesh = BuildVoxelMesh('PersonGraduated.qb', false);
	    this.model = OP.model.Create(this.mesh);

		// The basic effect to use for all rendering (for now)
		this.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', this.mesh.VertexSize);

		// The base material to use for all rendering (for now)
		this.material = OP.material.Create(this.effect);

		// The free flight camera
		this.camera = new Camera();


		this.camera.Look([-140, -40, 350], [ -140,-40,0]);


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
			this.background = OP.texture2D.Create(OP.cman.LoadGet('StartScreen.png'));

		return 1;
	},

	Update: function(timer) {

		if(OP.keyboard.WasPressed(OP.KEY.ESCAPE) || this.Data.gamePad0.WasPressed(OP.gamePad.BACK)) {
			return 1;
		}

		if(Input.WasActionPressed(this.Data.gamePad0)) {
			if(this.Data.selected == 1) return 1;

			//global.win = true;
			global.spawned = true;
			var scene = new Difficulty();
			OPgameState.Change(scene);
			return 0;
		}

		if(Input.WasUpPressed(this.Data.gamePad0)) {
			this.Data.selected--;
			if(this.Data.selected < 0) this.Data.selected = 1;
			this.Data.selected = this.Data.selected % 2;
		}

		if(Input.WasDownPressed(this.Data.gamePad0)) {
			this.Data.selected++;
			this.Data.selected = this.Data.selected % 2;
		}

		OP.render.Clear(0.3,0.3,0.3);

		OP.texture2D.Render(this.background);

		OP.render.Depth(1);
		this.model.world.SetScl(3);
		this.model.world.RotY(-0.7);
		//this.model.world.Translate(0, 0, 0);
		OP.model.Draw(this.model, this.material, this.camera.Camera());

		OP.fontRender.Begin(this.Data.fontManager36);
		this.Data.fontManager36.SetAlign(OP.FONTALIGN.LEFT);

		if(this.Data.selected == 0) {
			OP.fontRender.Color(0.0, 0.8, 0.0);
		} else {
			OP.fontRender.Color(1.0, 1.0, 1.0);
		}
		OP.fontRender("<", 420, 125);
		OP.fontRender("Start Game", 450, 125);

		if(this.Data.selected == 1) {
			OP.fontRender.Color(0.0, 0.8, 0.0);
		} else {
			OP.fontRender.Color(1.0, 1.0, 1.0);
		}
		OP.fontRender("<", 420, 175);
		OP.fontRender("Quit", 450, 175);

		OP.fontRender.End();

		OP.fontRender.Begin(this.Data.fontManager24);
		OP.fontRender("Created by Garrett Hoofman with music by Matt Javanshir", 100, 720 - 40);
		OP.fontRender.End();


		OP.render.Present();

		return 0;
	},

	Exit: function() {
		return 1;
	}
};

module.exports = MainMenu;
