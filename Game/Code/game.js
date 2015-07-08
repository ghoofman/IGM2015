var OP = require('OPengine');
var OPgameState = require('OPgameState');

var data = {

};

function Initialize() {

	return 1;
}

function update(timer) {


}

function render() {
	OP.render.Clear(0, 0, 0);

	OP.render.Present();

}

function Update(timer) {

	update(timer);
	render();

	return 0;
}


// Kills the game state
function Exit() {
	global.mixpanel.track("State Exit", {
		distinct_id: global.GUID,
		state: 'game'
	});
	return 1;
};


// Sets up the actual game state and returns it
module.exports = OPgameState.Create(Initialize, Update, Exit);
