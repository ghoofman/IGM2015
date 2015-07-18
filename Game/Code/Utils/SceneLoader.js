var OP = require('OPengine').OP;
var fs = require('fs');
var BuildVoxelMesh = require('./BuildVoxelMesh.js');
var Character = require('./Character.js');

function SceneLoader(scene, name) {

    this.scene = scene;

    this.vec3_0 = OP.vec3.Create(0,0,0);
    this.vec3_1 = OP.vec3.Create(0,0,0);
  	this.mat4 = new OP.mat4();

    this.material = OP.physX.CreateMaterial(0.8, 0.8, 0.6);

    this.Load(name);

}

SceneLoader.prototype = {
    scene: null,
    vec3_0: null,
    vec3_1: null,
    mat4: null,
    data: null,
    objects: [],
    characters: [],
    scale: 1,
    limits: [ 0, 0, 150, 350, 0, 0 ],

    Load: function(name) {
        var scene = JSON.parse(fs.readFileSync(__dirname + '/../' + name, 'utf8'));

        this.scale = scene.scale || 1;

        this.limits = [
          (scene.camera && scene.camera.xNegative) || 0,
          (scene.camera && scene.camera.xPositive) || 0,
          (scene.camera && scene.camera.yDistance) || 150,
          (scene.camera && scene.camera.zDistance) || 350,
          (scene.camera && scene.camera.zNegative) || 0,
          (scene.camera && scene.camera.zPositive) || 0
        ];

        var objects = [];
        for(var i = 0; i < scene.models.length; i++) {
            objects.push(this.AddObject(scene.models[i]));
        }

        var characters = [];
        if(scene.characters) {
          for(var i = 0; i < scene.characters.length; i++) {
            console.log('CHARACTER', i);
            var chr = scene.characters[i];
            characters.push(new Character(chr, this.scale, this.scene, this.material));
          }
        }

        // Add bounding Planes

      	var yNegative = 0;
      	var xNegative = -100;
      	var xPositive = 100;
      	var zNegative = -100;
      	var zPositive = 100;

      	if(scene.planes) {
        		yNegative = scene.planes.yNegative || yNegative;
        		xNegative = scene.planes.xNegative || xNegative;
        		xPositive = scene.planes.xPositive || xPositive;
        		zNegative = scene.planes.zNegative || zNegative;
        		zPositive = scene.planes.zPositive || zPositive;
      	}

      	this.vec3_0.Set(0, yNegative, 0);
      	this.vec3_1.Set(0, 0, 1);
      	var actor = OP.physXScene.CreateStatic(this.scene, this.vec3_0, 3.14 / 2.0, this.vec3_1);
      	OP.physX.AddPlaneShape(actor, this.material);
      	OP.physXScene.AddActor(this.scene, actor);


      	this.vec3_0.Set(xNegative, 0, 0);
      	this.vec3_1.Set(1, 0, 0);
      	actor = OP.physXScene.CreateStatic(this.scene, this.vec3_0);
      	OP.physX.AddPlaneShape(actor, this.material);
      	OP.physXScene.AddActor(this.scene, actor);


      	this.vec3_0.Set(xPositive, 0, 0);
      	this.vec3_1.Set(0, 1, 0);
      	actor = OP.physXScene.CreateStatic(this.scene, this.vec3_0, -3.14, this.vec3_1);
      	OP.physX.AddPlaneShape(actor, this.material);
      	OP.physXScene.AddActor(this.scene, actor);


      	this.vec3_0.Set(0, 0, zNegative);
      	this.vec3_1.Set(0, 1, 0);
      	actor = OP.physXScene.CreateStatic(this.scene, this.vec3_0, -3.14 / 2.0, this.vec3_1);
      	OP.physX.AddPlaneShape(actor, this.material);
      	OP.physXScene.AddActor(this.scene, actor);


      	this.vec3_0.Set(0, 0, zPositive);
      	this.vec3_1.Set(0, 1, 0);
      	actor = OP.physXScene.CreateStatic(this.scene, this.vec3_0, 3.14 / 2.0, this.vec3_1);
      	OP.physX.AddPlaneShape(actor, this.material);
      	OP.physXScene.AddActor(this.scene, actor);

        this.data = scene;
        this.objects = objects;
        this.characters = characters;
    },

    AddObject: function(json) {

      	var mesh = BuildVoxelMesh(json.file);
      	var model = OP.model.Create(mesh);

        var offset = json.offset;
      	var x = (offset && offset[0]) || 0;
      	var y = (offset && offset[1]) || 0;
      	var z = (offset && offset[2]) || 0;

        // Pushes the model up so that the bottom is at 0
      	model.world.SetTranslate(x, mesh.voxelData.size.y + y,z);

      	if(json.scale) {
      		model.world.Scl(json.scale[0], json.scale[1], json.scale[2]);
      	}

      	if(json.rotation) {
      		if(json.rotation[1]) {
      			model.world.RotY(json.rotation[1] * 3.14 / 180.0);
      		}
      	}

        var actors = [];
        var colliders = [];

      	this.vec3_0.Set(x, mesh.voxelData.size.y + y, z);
      	var actor = OP.physXScene.CreateStatic(this.scene, this.vec3_0);

        if(!json.collision || json.collision.default) {

        	this.vec3_0.Set(mesh.voxelData.size.x, mesh.voxelData.size.y, mesh.voxelData.size.z);
        	var shape = OP.physX.AddBoxShape(actor, this.material, this.vec3_0);

      		this.mat4.SetTranslate(0, 0, 0);
      		if(json.rotate) {
      				this.mat4.RotY((json.rotate[1] || 0) * 3.14 / 180.0);
      				OP.physX.ShapeSetPose(shape, this.mat4);
      		}
  				OP.physX.ShapeSetPose(shape, this.mat4);

        }


        if(json.collision && json.collision.custom) {
            for(var i = 0; i < json.collision.custom.length; i++) {
                var coll = json.collision.custom[i];

                if(coll.size) {
                    this.vec3_0.Set(coll.size[0], coll.size[1], coll.size[2]);
                } else {
                    this.vec3_0.Set(mesh.voxelData.size.x, mesh.voxelData.size.y, mesh.voxelData.size.z);
                }

                var shape = OP.physX.AddBoxShape(actor, this.material, this.vec3_0);

                if(coll.offset) {
                  this.mat4.SetTranslate(coll.offset[0], coll.offset[1], coll.offset[2]);
                  OP.physX.ShapeSetPose(shape, this.mat4);
                }

                if(!coll.collide) {
                	OP.physX.SetSimulation(shape, false);
                	OP.physX.SetTrigger(shape, true);
                	OP.physX.SetSceneQuery(shape, true);
                  colliders.push({
                      actor: actor,
                      shape: shape,
                      type: coll.type || '',
        							id: coll.id || 0,
                      data: coll.data || null,
                      name: coll.name || null
                  });
                }
              }
          }

        OP.physXScene.AddActor(this.scene, actor);
        actors.push(actor);


      	return {
        		model: model,
        		mesh: mesh,
        		actors: actors,
            colliders: colliders
      	};
    },

    Collisions: function(player) {
        var target = [
    			player.FootPos.x,
    			player.FootPos.y + player.mesh.voxelData.size.y / 2.0,
    			player.FootPos.z
    		];
    		this.vec3_1.Set(target[0], target[1], target[2]);
    		this.vec3_0.Set(10, 10, 10);


        var collisions = [];
    		for(var o = 0; o < this.objects.length; o++) {
      		  for(var i = 0; i < this.objects[o].colliders.length; i++) {
      			    if(OP.physX.ShapeBoxColliding(this.objects[o].colliders[i].actor, this.objects[o].colliders[i].shape, this.vec3_0, this.vec3_1)) {
      				      collisions.push(this.objects[o].colliders[i]);
      			    }
      		  }
    		}

    		for(var o = 0; o < this.characters.length; o++) {
            var colls = this.characters[o].Collisions(player);
            for(var i = 0; i < colls.length; i++) {
                collisions.push(colls[i]);
            }
    		}



        return collisions;
    },

    FindPosition: function(id) {
        if(this.data.positions) {
          for(var i = 0; i < this.data.positions.length; i++) {
            if(this.data.positions[i].id == id) {
              return this.data.positions[i].position;
            }
          }
        }
        return null;
    },

    Destroy: function() {
        OP.free(this.vec3_0);
        OP.free(this.vec3_1);
        OP.free(this.mat4);
    }

};

module.exports = SceneLoader;
