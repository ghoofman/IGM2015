var OP = require('OPengine').OP;
var BuildVoxelMesh = require('./BuildVoxelMesh.js');
var Talk = require('./Talk.js');
var fs = require('fs');

function Character(file, scale, scene, material, start) {

  var data = JSON.parse(fs.readFileSync(__dirname + '/../Scenes/' + file, 'utf8'));

  this.scale = scale || 1.0;
  this.manager = OP.physXController.CreateManager(scene);
  this.mesh = BuildVoxelMesh(data.file);
  this.model = OP.model.Create(this.mesh);
  this.controller = OP.physXController.Create(this.manager, material, this.mesh.voxelData.size.y * scale * 2.0, this.mesh.voxelData.size.x * scale * 0.75);

  start = start || [ -20, 0, 40 ];

  OP.physXController.SetFootPos(this.controller, start[0], start[1], start[2]);

  this.vec3 = OP.vec3.Create(0,0,0);
  this.vec3_1 = OP.vec3.Create(0,0,0);
  this.mat4 = new OP.mat4();

  this.material = OP.physX.CreateMaterial(0.8, 0.8, 0.6);

  this.vec3.Set(20 * scale, 20 * scale, 20 * scale);
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
        name: coll.name || 'Frank',
        character: this
      }
  ];
}

Character.prototype = {
    manager: null,
    mesh: null,
    model: null,
    controller: null,
    vec3: null,
    vec3_1: null,
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

    Collisions: function(player) {
        var target = [
    			player.FootPos.x,
    			player.FootPos.y + player.mesh.voxelData.size.y / 2.0,
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
      	this.model.world.SetScl(this.scale);
      	this.model.world.RotY(this.rotate);
      	this.model.world.Translate(this.FootPos.x, this.FootPos.y + Math.floor(this.mesh.voxelData.size.y * this.scale), this.FootPos.z);
      	OP.model.Draw(this.model, material, camera);
    },

    DrawPos: function(pos, rot, scl, material, camera) {
      	this.model.world.SetScl(scl);
      	this.model.world.RotX(rot[0]);
      	this.model.world.RotY(rot[1]);
      	this.model.world.Translate(pos[0], pos[1], pos[2]);
      	OP.model.Draw(this.model, material, camera);
    },

    Interact: function() {


        if(this.receivedCoffee) {
            return new Talk(this, "I'm all set for now. Thanks.");
        }

        if(global.inventory
            && global.inventory.cup
              && global.inventory.cup.coffee
              && global.inventory.cup.type == 'Tall'
              && global.inventory.cup.coffee.type == 'Bold') {
            global.inventory.cup = null;
        	global.game.cash += 2;
            this.receivedCoffee = true;
            if(!this.talked) {
        	       global.game.cash += 2;
                   return new Talk(this, 'Dude! How did you know? You psychic?', [ {
                       text: "Shhh don't tell anyone"
                   }, { text: "I just know these things" } ]);
            }
            return new Talk(this, 'Thanks bro-ski');
        }

        if(global.inventory
            && global.inventory.cup
              && global.inventory.cup.coffee
              && (global.inventory.cup.type != 'Tall'
                || global.inventory.cup.coffee.type != 'Bold')) {

                if(this.talked) {
                    return new Talk(this, 'Not what I asked for... I want a Tall Bold Coffee.');
                } else {
                    this.talked = true;
                    return new Talk(this, 'I want a Tall Bold Coffee... Not this...');
                }
        }

        this.talked = true;

        return new Talk(this, 'I want a Tall Bold Coffee. Right Now', [ {
            text: 'You got it'
        }, { text: "Can't do that right now" } ]);

        return null;
    }
};

module.exports = Character;
