var OP = require('OPengine').OP;
var OPgameState = require('OPgameState');

var data = {};
var tex2d = null;

function Initialize() {
	OP.font.LoadEffects();

	data.font = OP.font.Load('Ubuntu.opf');
	data.fontManager = OP.fontManager.Create(data.font);
	tex2d = OP.texture2D.Create(data.font.texture);

  return 1;
}

function Update(timer) {

  	OP.render.Clear(0.1, 0.1, 0.1);
		OP.texture2D.Render(tex2d);

			OP.render.Depth(0);
				OP.render.DepthWrite(0);
				OP.render.Blend(1);
		//
  	OP.font.Render.Begin(data.fontManager);
    OP.font.Render.Text('test', 200,200);

  	OP.font.Render.End();
		//
  	OP.render.Present();
	return 0;
}


// Kills the game state
function Exit() {
	return 1;
};


// Sets up the actual game state and returns it
module.exports = OPgameState.Create(Initialize, Update, Exit);
