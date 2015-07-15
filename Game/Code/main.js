var OP = require('OPengine').OP;
var OPgameState = require('OPgameState');
var MixPanel = require('./Utils/MixPanel.js');
var SceneCreator = require('./SceneCreator.js');

global.game = {
	money: 100000,
	cash: 100
};

try {

	MixPanel.Track("Application Started", {
		os: 'OSX'
	});

	var scene = new SceneCreator('/Scenes/Bedroom.json', 1);

	if(!process.env.WAYWARD_REPO) {
		process.env.WAYWARD_REPO = '..';
	}

	function AppInitialize() {
		OP.loaders.AddDefault();
		OP.loaders.AddVoxels();
		OP.skeleton.AddLoader();

		// TODO: (garrett) Correct it to location to load
		OP.cman.Init('../../Assets');
		OP.render.Init();
		OP.gamePad.SetDeadZones(0.2);

		// Initialize PhysX and the debugger
		OP.physX.Init();
		OP.physX.Debugger();

		MixPanel.Track("Application Initialized");

		OPgameState.Change(scene);
	}

	function AppUpdate(timer) {
		OP.keyboard.Update();
		OP.gamePad.Update();

		if (OP.keyboard.WasReleased(OP.KEY.ESCAPE)) return 1;

		return OPgameState.Active.Update(timer);
	}

	function AppDestroy() {
		MixPanel.Track("Application Shutdown");
		process.exit(1);
		return 1;
	}

	if(true) {
		var timer = OP.timer.Create();
		AppInitialize();

		function loop() {
			OP.timer.Update(timer);
			if(AppUpdate(timer)) {
				OPgameState.Active.Exit();
				AppDestroy();
			} else {
					setImmediate(loop);
			}
		}
		loop();
	} else {
		OP.start(
			AppInitialize,
			AppUpdate,
			AppDestroy
		);
	}
}
catch(exc) {
	console.log(exc);
}
