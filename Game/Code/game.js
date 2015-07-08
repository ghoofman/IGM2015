var OP = require('OPengine').OP;
var OPgameState = require('OPgameState');

var data = {
	scratch: {
		vec3: []
	}
};

function Initialize() {

	OP.render.Depth(1);

	data.scratch.vec3.push(OP.vec3.Create(0,0,0));

	var voxelGenerator = OP.voxelGenerator.Create(OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR);
	var voxelData = OP.cman.LoadGet('BuildingTest1.qb');
	console.log(voxelData);
	voxelGenerator.Add(voxelData);
	data.mesh = voxelGenerator.Build();

	data.model = OP.model.Create(data.mesh);

	data.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', data.mesh.VertexSize);

	data.material = OP.material.Create(data.effect);

	data.scratch.vec3[0].Set(5, 0, 5);
	data.camera = OP.camFreeFlight.Create(100.0, 3.0, data.scratch.vec3[0], 1.0, 2000.0);

	return 1;
}

function update(timer) {

	data.camera.Update(timer);

}

function render() {
	OP.render.Clear(0.2, 0, 0);

	OP.model.Draw(data.model, data.material, data.camera.Camera);

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
