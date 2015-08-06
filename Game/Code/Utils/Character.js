var OP = require('OPengine').OP;
var BuildVoxelMesh = require('./BuildVoxelMesh.js');
var Talk = require('./Talk.js');
var fs = require('fs');

function Character(json, scale, physXScene, material, scene) {

    this.json = json;
    this.data = JSON.parse(fs.readFileSync(__dirname + '/../Scenes/' + json.file, 'utf8'));

    this.name = this.data.name;

    this.height = 80;
    this.scale = scale || 1.0;
    this.physXScene = physXScene;
    this.scene = scene;
    this.mesh = BuildVoxelMesh(this.data.file);
    this.model = OP.model.Create(this.mesh);
    this.material = material;

    this.vec3 = OP.vec3.Create(0,0,0);
    this.vec3_1 = OP.vec3.Create(0,0,0);
    this.mat4 = new OP.mat4();

    if(this.data.AI) {
        var ai = require('../' + this.data.AI);
        this.AI = new ai(this);
    }

}

Character.prototype = {
    manager: null,
    mesh: null,
    model: null,
    controller: null,
    vec3: null,
    vec3_1: null,
    move: [ 0, 0, 0 ],
    rotate: 0.0,
    height: 40,
    FootPos: {
      x: 0, y: 0, z: 0
    },

    Setup: function(start) {
        this.alive = true;
        this.dead = false;

        this.manager = OP.physXController.CreateManager(this.physXScene);
        this.controller = OP.physXController.Create(this.manager, this.material, this.mesh.voxelData.size.y * this.scale * 2.0, this.mesh.voxelData.size.x * this.scale * 0.75);

        this.height = this.mesh.voxelData.size.y;

        var start = start || this.json.offset || [ -20, 0, 40 ];

        OP.physXController.SetFootPos(this.controller, start[0], start[1], start[2]);

        this.vec3.Set(20 * this.scale, 20 * this.scale, 20 * this.scale);
        var shape = OP.physX.AddBoxShape(this.controller.actor, this.material, this.vec3);
        OP.physX.SetSimulation(shape, false);
        OP.physX.SetTrigger(shape, true);
        OP.physX.SetSceneQuery(shape, true);

        var coll = {};
        this.colliders = [
            {
              actor: this.controller.actor,
              shape: shape,
              type: 'character',
              id: coll.id || 0,
              data: coll.data || null,
              name: coll.name || this.data.name,
              character: this
            }
        ];
    },

    Update: function(timer, scene) {
        // TODO: fill with AI
        this.AI && this.AI.Update && this.AI.Update(timer, scene);
    },

    Move: function(timer) {
        if(!this.alive) return;
        this.vec3.Set(this.move[0], this.move[1], this.move[2]);
    		OP.physXController.Move(this.controller, this.vec3, timer);
        this.move = [ 0, -0.98 * 4, 0 ];
        this.FootPos = OP.physXController.GetFootPos(this.controller);
    },

    Collisions: function(player) {
        if(!this.alive) return [];

        var h = 20;

        var target = [
    			player.FootPos.x,
    			player.FootPos.y + h / 2.0,
    			player.FootPos.z
    		];

		this.vec3_1.Set(target[0], target[1], target[2]);
		this.vec3.Set(10, 10, 10);

        this.mat4.SetTranslate(this.FootPos.x, this.FootPos.y, this.FootPos.z);

        var collisions = [];
	    if(OP.physX.TransformBoxColliding(this.mat4, this.colliders[0].shape, this.vec3, this.vec3_1)) {
            collisions.push(this.colliders[0]);
	    }

        return collisions;
    },

    Draw: function(material, camera) {
        if(this.dead || !this.alive) return;
      	this.model.world.SetScl(this.scale);
      	this.model.world.RotY(this.rotate);
      	this.model.world.Translate(this.FootPos.x, this.FootPos.y + Math.floor(this.mesh.voxelData.size.y * this.scale), this.FootPos.z);
      	OP.model.Draw(this.model, material, camera);
    },

    DrawPos: function(pos, rot, scl, material, camera) {
        if(this.dead) return;
      	this.model.world.SetScl(scl);
      	this.model.world.RotX(rot[0]);
      	this.model.world.RotY(rot[1]);
      	this.model.world.Translate(pos[0], pos[1], pos[2]);
      	OP.model.Draw(this.model, material, camera);
    },

    Interact: function() {
        if(this.dead || !this.alive) return;

        if(this.AI) {
            return this.AI.Interact && this.AI.Interact();
        }

        return null;
    },

    ForceInteract: function() {
        if(this.AI) {
            return this.AI.Interact && this.AI.Interact();
        }

        return null;
    },

    EndOfDay: function() {
        if(this.AI) {
            this.AI.EndOfDay && this.AI.EndOfDay();
        }
    }
};

module.exports = Character;
