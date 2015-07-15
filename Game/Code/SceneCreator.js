var OP = require('OPengine').OP,
		OPgameState = require('OPgameState'),
		OptionSelector = require('./Utils/OptionSelector.js'),
		BuildVoxelMesh = require('./Utils/BuildVoxelMesh.js'),
 		Player = require('./Utils/Player.js'),
 		SceneLoader = require('./Utils/SceneLoader.js'),
	 	Camera = require('./Utils/Camera.js'),
 		MixPanel = require('./Utils/MixPanel.js'),
		Coffee = require('./Games/Coffee.js'),
		Selector = require('./Games/Selector.js');

function SceneCreator(file, callingId) {
		this.Data.file = file;
		this.Data.callingId = callingId;
}

SceneCreator.prototype = {
		Data: {

		},

		Initialize: function() {

				OP.render.Depth(1);

				// Get the gamepad to use
				this.Data.gamePad0 = OP.gamePad.Get(0);

				// Setup the font manager
				this.Data.fontManager = OP.fontManager.Setup('pixel.opf');


				// TODO: move to the scene loader
				var self = this;
				function RemoveOption() {
					self.Data.option = null;
				};
				RemoveOption();

				this.Data.optionSelector2 = new OptionSelector('Ready to call it a day?', [
					{ text: 'Yes', select: RemoveOption },
					{ text: 'No', select: RemoveOption }
				]);


				// Create the initial scene with a default gravity of -9.8
				var vec3 = OP.vec3.Create(0,0,0);
				vec3.Set(0,-9.8,0);
				this.Data.physXScene = OP.physXScene.Create(vec3);
				OP.free(vec3);

				// Create a base material to use through out the scene
				this.Data.physXmaterial = OP.physX.CreateMaterial(0.8, 0.8, 0.6);

				// Load up the scene from the json file
				this.Data.scene = new SceneLoader(this.Data.physXScene, this.Data.file);

				// Get the location to spawn the player at based on an id in the positions of the json data
				var start = null;
				if(this.Data.callingId) {
						start = this.Data.scene.FindPosition(this.Data.callingId);
				}

				// Create the Player
				this.Data.player = new Player(this.Data.scene.scale, this.Data.physXScene, this.Data.physXmaterial, start);

				// The basic effect to use for all rendering (for now)
				this.Data.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', this.Data.player.mesh.VertexSize);

				// The base material to use for all rendering (for now)
				this.Data.material = OP.material.Create(this.Data.effect);

				// The free flight camera
				this.Data.camera = new Camera(this.Data.scene.limits);

				return 1;
		},

		update: function(timer) {
				if(this.Data.game) {
					if(this.Data.game.Update(timer, this.Data.gamePad0)) {
						this.Data.game.Exit();
						this.Data.game = null;
					}
					return;
				}
				if(this.Data.option) {
						// Getting a selection
						this.Data.option.Update(this.Data.gamePad0);
						return;
				}

				// Toggle between driving the character and driving the camera
				if (this.Data.gamePad0.WasPressed(OP.gamePad.START) || OP.keyboard.WasPressed(OP.KEY.ENTER))  {
					this.Data.camera.ToggleControl();
				}

				if (!this.Data.camera.freeForm) {
					this.Data.player.Update(timer, this.Data.gamePad0);
				}

				OP.physXScene.Update(this.Data.physXScene, timer);

				for(var i = 0; i < this.Data.scene.characters.length; i++) {
					this.Data.scene.characters[i].Move(timer);
				}
				this.Data.player.Move(timer);

				this.Data.camera.Update(timer);
				this.Data.camera.LookAt(this.Data.player);

				// Activation Key was pressed: check for collisions
				var collisions = this.Data.scene.Collisions(this.Data.player);
				this.Data.Name = null;
				for(var i = 0; i < collisions.length; i++) {
						if(collisions[i].name) {
								this.Data.Name = collisions[i].name;
								break;
						}
				}

				if(OP.keyboard.WasPressed(OP.KEY.E) || this.Data.gamePad0.WasPressed(OP.gamePad.Y)) {
						for(var i = 0; i < collisions.length; i++) {
								if(collisions[i].type == 'door') {
										MixPanel.Track("Opened Door in " + this.Data.scene.data.name, { state: this.Data.scene.data.name, id: collisions[i].id });
										var SceneCreator = require('./SceneCreator.js');
										OPgameState.Change(new SceneCreator(collisions[i].data.file, collisions[i].id));
										return 0;
								} else if(collisions[i].type == 'game') {
										switch(collisions[i].data.game) {
												case 'coffee': {
													this.Data.game = new Coffee();
												}
												case 'selector': {
													this.Data.game = new Selector(this.Data.player);
												}
										}
								}

								if(collisions[i].id == 1) {
										this.Data.opened = !this.Data.opened;
										this.Data.option = this.Data.optionSelector2;
								}
						}
				}

				return 0;
		},

		Update: function(timer) {
				this.update(timer);
				this.Render();
		},

		Render: function() {
				OP.render.Clear(0, 0, 0);

				OP.render.Depth(1);

				for(var i = 0; i < this.Data.scene.objects.length; i++) {
					OP.model.Draw(this.Data.scene.objects[i].model, this.Data.material, this.Data.camera.Camera());
				}

				for(var i = 0; i < this.Data.scene.characters.length; i++) {
					this.Data.scene.characters[i].Draw(this.Data.material, this.Data.camera.Camera());
				}

				this.Data.player.Draw(this.Data.material, this.Data.camera.Camera());

				this.Data.option && this.Data.option.Render(this.Data.fontManager);



				if(this.Data.game) {
					this.Data.game.Draw();
				} else {
						OP.fontRender.Begin(this.Data.fontManager);
						this.Data.fontManager.SetAlign(OP.FONTALIGN.LEFT);
		    		OP.fontRender.Color(50.0 / 255.0, 165.0 / 255.0, 84.0 / 255.0);
						OP.fontRender('$' + global.game.cash, 50, 50);
						if(this.Data.Name) {
								this.Data.fontManager.SetAlign(OP.FONTALIGN.CENTER);
			      		OP.fontRender.Color(0.9, 0.9, 0.9);
					    	OP.fontRender(this.Data.Name, 1280 / 2.0, 50);
						}
						OP.fontRender.End();
				}


				OP.render.Present();
		},

		Exit: function() {
				OP.fontManager.Destroy(this.Data.fontManager);
				OP.physXScene.Destroy(this.Data.physXScene);
				this.Data.scene.Destroy();
				return 1;
		}

};

// This is in essence a GameState
module.exports = SceneCreator;
