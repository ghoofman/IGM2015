var OP = require('OPengine').OP;
var OPgameState = require('OPgameState');
var MixPanel = require('./Utils/MixPanel.js');
var SceneCreator = require('./SceneCreator.js');
var Inventory = require('./Utils/Inventory.js');
var AudioPlayer = require('./Utils/AudioPlayer.js');
var Wallet = require('./Utils/Wallet.js');

global.game = {
	money: 100000,
	cash: 10,
	target: 10,
	loans: 10
};

global.ai = {

};

global.wallet = new Wallet();

global.time = new Date();
global.time.setHours(8);
global.time.setMinutes(0);
global.time.setSeconds(0);
global.time.setMilliseconds(0);

global.timeScale = 1000;

global.tasks = [
	{
		text: 'Find an Apartment',
		complete: function() { return global.inventory.Has('apartment-key'); },
		time: -1000
	},
	{
		text: 'Find a Job',
		complete: function() { return global.inventory.Has('cafe-key'); },
		time: -2000
	}
];

try {

	MixPanel.Track("Application Started", {
		os: 'OSX'
	});

	global.debug = true;
	var scene = new SceneCreator('/Scenes/Bedroom.json', 1);
	//var scene = new SceneCreator('/Scenes/Cafe.json', 1);
	//var scene = new SceneCreator('/Scenes/Street.json', 1);
	//var scene = new SceneCreator('/Scenes/Apartment.json', 1);
	//var scene = new SceneCreator('/Scenes/Hallway.json', 1);

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

		OP.fmod.Init();
		global.AudioPlayer = new AudioPlayer();
		//global.AudioPlayer.AddBackground('Audio/Background.ogg');

		MixPanel.Track("Application Initialized");

		global.inventory = new Inventory();

		OPgameState.Change(scene);
	}

	function AppUpdate(timer) {
		global.AudioPlayer.Update(timer);

		if (OP.keyboard.WasReleased(OP.KEY.T)) {
			global.AudioPlayer.PlayEffect('Audio/pew.wav');
		}

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
