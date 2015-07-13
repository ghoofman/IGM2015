var OP = require('OPengine').OP;
var BuildVoxelMesh = require('./BuildVoxelMesh.js');

function Player(scene, material) {
  this.manager = OP.physXController.CreateManager(scene);
  this.mesh = BuildVoxelMesh('Person.qb');
  this.model = OP.model.Create(this.mesh);
  this.controller = OP.physXController.Create(this.manager, material, this.mesh.voxelData.size.y, this.mesh.voxelData.size.x / 3.0);

  OP.physXController.SetFootPos(this.controller, 0, 0, 60);

  this.vec3 = OP.vec3.Create(0,0,0);
}

Player.prototype = {
    manager: null,
    mesh: null,
    model: null,
    controller: null,
    vec3: null,
    move: [ 0, 0, 0 ],
    rotate: 0,
    FootPos: {
      x: 0, y: 0, z: 0
    },

    Update: function(timer, gamepad) {
    		var x = 0, y = -0.98 * 4, z = 0;

        var left = gamepad.LeftThumb();
        x += left.x;
        z -= left.y;

        x += OP.keyboard.IsDown(OP.KEY.D);
        x -= OP.keyboard.IsDown(OP.KEY.A);
        z += OP.keyboard.IsDown(OP.KEY.S);
        z -= OP.keyboard.IsDown(OP.KEY.W);

        x *= 4; z *= 4;

        if(OP.keyboard.IsDown(OP.KEY.SPACE) || gamepad.IsDown(OP.gamePad.A)) {
          y = 2.0;
        }

        if(x != 0 || z != 0) {
          this.rotate = Math.atan2(x, z);
        }

        this.move = [ x, y, z ];
    },

    Move: function(timer) {
      this.vec3.Set(this.move[0], this.move[1], this.move[2]);
  		OP.physXController.Move(this.controller, this.vec3, timer);
      this.move = [ 0, -0.98 * 4, 0 ];
      this.FootPos = OP.physXController.GetFootPos(this.controller);
    },

    Draw: function(material, camera) {
      	this.model.world.SetScl(0.5);
      	this.model.world.RotY(this.rotate);
      	this.model.world.Translate(this.FootPos.x, this.FootPos.y + Math.floor(this.mesh.voxelData.size.y / 2.0), this.FootPos.z);
      	OP.model.Draw(this.model, material, camera);
    }
};

module.exports = Player;
