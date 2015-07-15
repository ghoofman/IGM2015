var OP = require('OPengine').OP;
var BuildVoxelMesh = require('./BuildVoxelMesh.js');

function Character(model, scale, scene, material, start) {
  this.scale = scale || 1.0;
  this.manager = OP.physXController.CreateManager(scene);
  this.mesh = BuildVoxelMesh(model);
  this.model = OP.model.Create(this.mesh);
  this.controller = OP.physXController.Create(this.manager, material, this.mesh.voxelData.size.y * scale * 2.0, this.mesh.voxelData.size.x * scale * 0.75);

  start = start || [ -20, 0, 40 ];

  OP.physXController.SetFootPos(this.controller, start[0], start[1], start[2]);

  this.vec3 = OP.vec3.Create(0,0,0);
}

Character.prototype = {
    manager: null,
    mesh: null,
    model: null,
    controller: null,
    vec3: null,
    move: [ 0, 0, 0 ],
    rotate: 3.0,
    FootPos: {
      x: 0, y: 0, z: 0
    },

    Update: function(timer) {
      // TODO: fill with AI
    },

    Move: function(timer) {
      this.vec3.Set(this.move[0], this.move[1], this.move[2]);
  		OP.physXController.Move(this.controller, this.vec3, timer);
      this.move = [ 0, -0.98 * 4, 0 ];
      this.FootPos = OP.physXController.GetFootPos(this.controller);
    },

    Draw: function(material, camera) {
      	this.model.world.SetScl(this.scale);
      	this.model.world.RotY(this.rotate);
      	this.model.world.Translate(this.FootPos.x, this.FootPos.y + Math.floor(this.mesh.voxelData.size.y * this.scale), this.FootPos.z);
      	OP.model.Draw(this.model, material, camera);
    }
};

module.exports = Character;
