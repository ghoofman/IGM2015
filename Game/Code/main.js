var OP = require('OPengine').OP;
var OPgameState = require('OPgameState');
var Mixpanel = require('mixpanel');

try {

	global.GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});

	global.mixpanel = Mixpanel.init('e7f7fdf03c6d140ff659e3b5daa5b9aa');
	global.mixpanel.track("Application Started", {
		os: 'OSX',
		distinct_id: global.GUID
	});

	var exampleSelectorState = require('./game.js');

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

		global.mixpanel.track("Application Initialized", {
			distinct_id: global.GUID
		});
	}

	function AppUpdate(timer) {
		OP.keyboard.Update();
		OP.gamePad.Update();

		if (OP.keyboard.WasReleased(OP.KEY.ESCAPE)) return 1;
		if (OP.keyboard.WasReleased(OP.KEY.BACKSPACE) && OPgameState.Active != exampleSelectorState) {
			OPgameState.Change(exampleSelectorState);
		}

		return OPgameState.Active.Update(timer);
		return 0;
	}

	function AppDestroy() {
		global.mixpanel.track("Application Shutdown", {
			distinct_id: global.GUID
		});
		process.exit(1);
		return 1;
	}

	if(true) {
		AppInitialize();

		var timer = OP.timer.Create();
		OPgameState.Change(exampleSelectorState);

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
