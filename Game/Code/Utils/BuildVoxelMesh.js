var OP = require('OPengine').OP;

function BuildVoxelMesh(model, hideBackFaces, skipCache) {
	if(!skipCache && global.meshes[model]) {
		return global.meshes[model];
	}

	var hide = false;
	if(hideBackFaces) {
		hide = true;
	}

	var voxelGenerator = OP.voxelGenerator.Create(OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR);
	var voxelData = OP.voxels.Load(model);
	voxelGenerator.Add(voxelData, 1, hide);
	var mesh = voxelGenerator.Build(hide);
	mesh.voxelData = voxelData;
	voxelGenerator.Destroy();

	global.meshes[model] = mesh;

	return mesh;
}

module.exports = BuildVoxelMesh;
