var OP = require('OPengine').OP;
var OPgameState = require('OPgameState');
var MixPanel = require('./Utils/MixPanel.js');
var MainMenu = require('./MainMenu.js');
var Inventory = require('./Utils/Inventory.js');
var AudioPlayer = require('./Utils/AudioPlayer.js');
var Wallet = require('./Utils/Wallet.js');

// Setup global values
global.debug = true;

try {

	MixPanel.Track("Application Started", {
		os: 'OSX'
	});

	var scene = new MainMenu();

	if(!process.env.WAYWARD_REPO) {
		process.env.WAYWARD_REPO = '..';
	}

	function AppInitialize() {
		OP.loaders.AddDefault();
		OP.loaders.AddVoxels();
		OP.skeleton.AddLoader();

		//OP.render.FullScreen(1);
		//OP.render.SetScreenSize(1920, 1080);

		// TODO: (garrett) Correct it to location to load
		if(OP.defined.OPIFEX_OPTION_RELEASE) {
			OP.cman.Init('../Assets');
		} else {
			OP.cman.Init('../../Assets');
		}
		OP.render.Init();
		OP.gamePad.SetDeadZones(0.3);

		// Initialize PhysX and the debugger
		OP.physX.Init();
		OP.physX.Debugger();

		OP.fmod.Init();
		global.AudioPlayer = new AudioPlayer();
		global.AudioPlayer.AddBackground('Audio/Degree_BG.ogg');

		MixPanel.Track("Application Initialized");

		global.inventory = new Inventory();

		OPgameState.Change(scene);
	}

	function AppUpdate(timer) {
		global.AudioPlayer.Update(timer);

		// if (OP.keyboard.WasReleased(OP.KEY.T)) {
		// 	global.AudioPlayer.PlayEffect('Audio/pew.wav');
		// }

		OP.keyboard.Update();
		OP.gamePad.Update();

		if (global.debug && OP.keyboard.WasReleased(OP.KEY.ESCAPE)) return 1;

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
