var OP = require('OPengine').OP;

function BuildVoxelMesh(model) {
	var voxelGenerator = OP.voxelGenerator.Create(OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR);
	var voxelData = OP.voxels.Load(model);
	voxelGenerator.Add(voxelData, 1);
	var mesh = voxelGenerator.Build();
	mesh.voxelData = voxelData;
	voxelGenerator.Destroy();
	return mesh;
}

module.exports = BuildVoxelMesh;
