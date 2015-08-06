var OP = require('OPengine').OP;
var BuildVoxelMesh = require('./BuildVoxelMesh.js');
var Input = require('./Input.js');

function Player(scale, scene, material, start, worldScene) {
  this.scale = scale || 1.0;
  this.scene = scene;
  this.worldScene = worldScene;
  this.material = material;

  this.start = start;
  //this.mesh = BuildVoxelMesh('Person.qb', false, true);
  this.mesh = OP.cman.LoadGet('Person.opm');
  this.model = OP.model.Create(this.mesh);

    // The basic effect to use for all rendering (for now)
    this.effect = OP.effect.Gen('Skinning.vert', 'Skinning.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.UV | OP.ATTR.BONES, 'Voxel Shader', this.mesh.VertexSize);

    // The base material to use for all rendering (for now)
    this.renderMaterial = OP.material.Create(this.effect);
    this.tex = OP.cman.LoadGet('Person.png');
    this.renderMaterial.AddParam(OP.material.ParamType.TEXTURE, 'uColorTexture', this.tex, 1);

    this.skeleton = OP.skeleton.Wrap(OP.cman.LoadGet('person.opm.skel'));

    this.renderMaterial.AddParam(OP.material.ParamType.MATRIX4V, "uBones", this.skeleton.skinned, this.skeleton.hierarchyCount);

    this.walk = OP.cman.LoadGet("person.opm.Take 001.anim");
    this.idle = OP.cman.LoadGet("person.opm.Idle.anim");
    this.animation = this.idle;


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
    height: 80,
    FootPos: {
      x: 0, y: 0, z: 0
    },

    Setup: function(start) {
        this.manager = OP.physXController.CreateManager(this.scene);
        // var height = this.mesh.voxelData.size.y;
        // var width = this.mesh.voxelData.size.x;
        this.height = 80;
        var width = 15;
        this.controller = OP.physXController.Create(this.manager,
            this.material,
            this.height * this.scale * 2.0,
            width * this.scale * 0.75);

        this.start = start || this.start || [ -20, 0, 40 ];

        OP.physXController.SetFootPos(this.controller, this.start[0], this.start[1], this.start[2]);

        this.vec3 = OP.vec3.Create(0,0,0);

        this.alive = true;
        global.spawned = true;
    },

    Update: function(timer, gamepad) {
        if(!this.alive) return;

        //OP.mat4.SetScl({ ptr: this.skeleton.skinned }, )


    		var x = 0, y = -0.98 * 4, z = 0;

        var left = gamepad.LeftThumb();
        x += left.x;
        z -= left.y;

        x += OP.keyboard.IsDown(OP.KEY.D) || OP.keyboard.IsDown(OP.KEY.RIGHT) || gamepad.IsDown(OP.gamePad.DPAD_RIGHT);
        x -= OP.keyboard.IsDown(OP.KEY.A) || OP.keyboard.IsDown(OP.KEY.LEFT) || gamepad.IsDown(OP.gamePad.DPAD_LEFT);
        z += OP.keyboard.IsDown(OP.KEY.S) || OP.keyboard.IsDown(OP.KEY.DOWN) || gamepad.IsDown(OP.gamePad.DPAD_DOWN);
        z -= OP.keyboard.IsDown(OP.KEY.W) || OP.keyboard.IsDown(OP.KEY.UP) || gamepad.IsDown(OP.gamePad.DPAD_UP);

        x *= this.scale * 3.0; z *= this.scale * 3.0;

        if(global.debug && Input.IsJumpDown(gamepad)) {
          y = 2.0;
        }

        if(x != 0 || z != 0) {
          this.rotate = Math.atan2(x, z);
        }

        this.move = [ x, y, z ];

        if(this.move[0] + this.FootPos.x < this.worldScene.xNegative || this.move[0] + this.FootPos.x > this.worldScene.xPositive) {
            this.move[0] = 0;
        }

        if(this.move[2] + this.FootPos.z < this.worldScene.zNegative || this.move[2] + this.FootPos.z > this.worldScene.zPositive) {
            this.move[2] = 0;
        }


        var amount = 1.0;

        var dx = Math.abs(this.move[0]);
        var dz = Math.abs(this.move[2]);
        var len = Math.sqrt(dx * dx + dz * dz);
        dx = dx / len;
        dz = dz / len;

        if(dx > 0 || dz > 0) {
            this.animation = this.walk;
            amount = Math.sqrt(dx * dx + dz * dz);
        } else {
            this.animation = this.idle;
        }

        var tmp = timer.elapsed;
        timer.elapsed = timer.actualElapsed * global.animScale * amount;
        OP.timer.SetElapsed(timer, timer.elapsed);

        OP.skeletonAnimation.Update(this.animation, timer);
        OP.skeletonAnimation.Apply(this.animation, this.skeleton);
        OP.skeleton.Update(this.skeleton);

        timer.elapsed = tmp;
        OP.timer.SetElapsed(timer, timer.elapsed);

    },

    Move: function(timer) {
        if(!this.alive) return;
        this.vec3.Set(this.move[0], this.move[1], this.move[2]);
        this.vec3.Norm();
        var scl = (timer.actualElapsed / 6.0) * timer.scaled;
        this.vec3.Set(this.vec3.x * scl, this.vec3.y * scl, this.vec3.z * scl);

  		OP.physXController.Move(this.controller, this.vec3, timer);
        this.move = [ 0, -0.98 * 4, 0 ];
        this.FootPos = OP.physXController.GetFootPos(this.controller);

        var changed = false;
        if(this.FootPos.x < this.worldScene.xNegative) {
            this.FootPos.x = this.worldScene.xNegative;
            changed = true;
        } else if(this.FootPos.x > this.worldScene.xPositive) {
            this.FootPos.x = this.worldScene.xPositive;
            changed = true;
        }
        if(this.FootPos.z < this.worldScene.zNegative) {
            this.FootPos.z = this.worldScene.zNegative;
            changed = true;
        } else if(this.FootPos.z > this.worldScene.zPositive) {
            this.FootPos.z = this.worldScene.zPositive;
            changed = true;
        }

        if(changed) {
            OP.physXController.SetFootPos(this.controller, this.FootPos.x, this.FootPos.y, this.FootPos.z);
        }
    },

    Position: function(pos) {
        OP.physXController.SetFootPos(this.controller, pos[0], pos[1], pos[2]);
    },

    Draw: function(material, camera) {
        if(!this.alive) return;
      	this.model.world.SetScl(this.scale);
      	this.model.world.RotY(this.rotate);
        // + Math.floor(this.height * this.scale)
      	this.model.world.Translate(this.FootPos.x, this.FootPos.y, this.FootPos.z);
      	OP.model.Draw(this.model, this.renderMaterial, camera);
    },

    DrawPos: function(pos, rot, scl, material, camera) {
        if(!this.alive) return;
      	this.model.world.SetScl(scl);
      	this.model.world.RotX(rot[0]);
      	this.model.world.RotY(rot[1]);
      	this.model.world.Translate(pos[0], pos[1], pos[2]);
      	OP.model.Draw(this.model, this.renderMaterial, camera);
    }
};

module.exports = Player;
