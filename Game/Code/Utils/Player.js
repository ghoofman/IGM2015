var OP = require('OPengine').OP;
var BuildVoxelMesh = require('./BuildVoxelMesh.js');

function Player(scale, scene, material, start) {
  this.scale = scale || 1.0;
  this.scene = scene;
  this.material = material;
  this.start = start;
  this.mesh = BuildVoxelMesh('Person.qb');
  this.model = OP.model.Create(this.mesh);

  if(global.spawned || global.debug) {
      this.Setup();
  }
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

    Setup: function() {
        this.manager = OP.physXController.CreateManager(this.scene);
        this.controller = OP.physXController.Create(this.manager, this.material, this.mesh.voxelData.size.y * this.scale * 2.0, this.mesh.voxelData.size.x * this.scale * 0.75);

        this.start = this.start || [ -20, 0, 40 ];

        OP.physXController.SetFootPos(this.controller, this.start[0], this.start[1], this.start[2]);

        this.vec3 = OP.vec3.Create(0,0,0);

        this.alive = true;
        global.spawned = true;
    },

    Update: function(timer, gamepad) {
        if(!this.alive) return;
    		var x = 0, y = -0.98 * 4, z = 0;

        var left = gamepad.LeftThumb();
        x += left.x;
        z -= left.y;

        x += OP.keyboard.IsDown(OP.KEY.D) || OP.keyboard.IsDown(OP.KEY.RIGHT) || gamepad.IsDown(OP.gamePad.DPAD_RIGHT);
        x -= OP.keyboard.IsDown(OP.KEY.A) || OP.keyboard.IsDown(OP.KEY.LEFT) || gamepad.IsDown(OP.gamePad.DPAD_LEFT);
        z += OP.keyboard.IsDown(OP.KEY.S) || OP.keyboard.IsDown(OP.KEY.DOWN) || gamepad.IsDown(OP.gamePad.DPAD_DOWN);
        z -= OP.keyboard.IsDown(OP.KEY.W) || OP.keyboard.IsDown(OP.KEY.UP) || gamepad.IsDown(OP.gamePad.DPAD_UP);

        x *= this.scale * 3.0; z *= this.scale * 3.0;

        if(OP.keyboard.IsDown(OP.KEY.SPACE) || gamepad.IsDown(OP.gamePad.A)) {
          y = 2.0;
        }

        if(x != 0 || z != 0) {
          this.rotate = Math.atan2(x, z);
        }

        this.move = [ x, y, z ];
    },

    Move: function(timer) {
        if(!this.alive) return;
      this.vec3.Set(this.move[0], this.move[1], this.move[2]);
  		OP.physXController.Move(this.controller, this.vec3, timer);
      this.move = [ 0, -0.98 * 4, 0 ];
      this.FootPos = OP.physXController.GetFootPos(this.controller);
    },

    Draw: function(material, camera) {
        if(!this.alive) return;
      	this.model.world.SetScl(this.scale);
      	this.model.world.RotY(this.rotate);
      	this.model.world.Translate(this.FootPos.x, this.FootPos.y + Math.floor(this.mesh.voxelData.size.y * this.scale), this.FootPos.z);
      	OP.model.Draw(this.model, material, camera);
    },

    DrawPos: function(pos, rot, scl, material, camera) {
        if(!this.alive) return;
      	this.model.world.SetScl(scl);
      	this.model.world.RotX(rot[0]);
      	this.model.world.RotY(rot[1]);
      	this.model.world.Translate(pos[0], pos[1], pos[2]);
      	OP.model.Draw(this.model, material, camera);
    }
};

module.exports = Player;
