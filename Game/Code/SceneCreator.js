var OP = require('OPengine').OP,
		OPgameState = require('OPgameState'),
		OptionSelector = require('./Utils/OptionSelector.js'),
		BuildVoxelMesh = require('./Utils/BuildVoxelMesh.js'),
 		Player = require('./Utils/Player.js'),
 		SceneLoader = require('./Utils/SceneLoader.js'),
	 	Camera = require('./Utils/Camera.js'),
 		MixPanel = require('./Utils/MixPanel.js'),
		DateAndTime = require('date-and-time'),
		Input = require('./Utils/Input.js'),
		JSON = require('./Utils/JSON.js');

function SceneCreator(file, callingId) {
		this.Data.file = file;
		this.Data.callingId = callingId;
		global.sceneEntered = callingId;
		console.log("LOADING SCENE", file);
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
				this.Data.fontManager24 = OP.fontManager.Setup('pixel24.opf');
				this.Data.fontManager36 = OP.fontManager.Setup('pixel36.opf');
				this.Data.fontManagerUI = OP.fontManager.Setup('ui.opf');


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

				global.player = this.Data.player;

				// The basic effect to use for all rendering (for now)
				this.Data.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', this.Data.player.mesh.VertexSize);

				// The base material to use for all rendering (for now)
				this.Data.material = OP.material.Create(this.Data.effect);

				// The free flight camera
				this.Data.camera = new Camera(this.Data.scene.limits);

				var sheet = 'BaseSelector';
				OP.cman.Load(sheet + '.opss');

				var sprites = [];
				sprites.push(OP.cman.Get(sheet + '/Black50'));
				sprites.push(OP.cman.Get(sheet + '/Dollar'));

			  	this.Data.size = OP.render.Size();
				this.spriteSystem = OP.spriteSystem.Create(sprites, 6, OP.SPRITESYSTEMALIGN.CENTER);
				this.screenCamera = OP.cam.Ortho(0, 0, 10, 0, 0, 0, 0, 1, 0, 0.1, 20.0, 0, this.Data.size.ScaledWidth, 0, this.Data.size.ScaledHeight);

				this.Data.bgSprite = null;

				this.Data.dollar = OP.spriteSystem.Add(this.spriteSystem);
				this.Data.dollar.Position.Set(100, 50);
				OP.spriteSystem.SetSprite(this.Data.dollar, 1);

				var diploma = JSON('Scenes/Items/Diploma.json');
				global.inventory.Add(diploma.key, diploma.data);

				return 1;
		},

		update: function(timer) {

			if(global.tasks.length == 0) {
				global.timeScale = 1000;
			} else {
				global.timeScale = 10;
			}


            if(global.job && global.job.clocked) {
				console.log('clocked in');
                global.job.time += timer.elapsed * global.timeScale;
            }

			var beforeAddingHour = global.time.getHours();
			global.time = DateAndTime.addMilliseconds(global.time, timer.elapsed * global.timeScale);
			var afterAddingHour = global.time.getHours();

			if(beforeAddingHour == 23 && afterAddingHour == 0) {
				global.wallet.AddExpense('Mugged', 'mugged', global.wallet.cash);
				var game = require('./Games/EndOfDay.js');
				this.Data.game = game(this.Data.scene);
			}

			if(beforeAddingHour == 22 && afterAddingHour == 23) {
				global.tasks.push({
					text: 'Get to bed',
					complete: function() {
						return global.time.getHours() >= 8 && global.time.getHours() < 22;
					},
					time: -1000
				});
			}

			global.wallet.Update(timer);

			for(var i = 0; i < this.Data.scene.characters.length; i++) {
				this.Data.scene.characters[i].Update(timer, this.Data.scene);
			}

				if(this.Data.game) {
					var result = this.Data.game.Update(timer, this.Data.gamePad0);
					if(result.result == -1) {
						return -1;
					}
					if(result.result) {
						this.Data.game.Exit && this.Data.game.Exit();
						this.Data.game = result.next;
					}
					return 0;
				}

				if(this.Data.option) {
						// Getting a selection
						this.Data.option.Update(this.Data.gamePad0);
						return 0;
				}

				if (Input.WasBackPressed(this.Data.gamePad0))  {
					var game = require('./Games/InventoryViewer.js');
					this.Data.game = game();
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

				var collisions = this.Data.scene.Collisions(this.Data.player);
				var name = this.Data.Name;
				this.Data.Name = null;
				for(var i = 0; i < collisions.length; i++) {
					if(collisions[i].name) {
						this.Data.Name = collisions[i].name;
						this.Data.Required = '';

						if(collisions[i].type == 'game' && collisions[i].data && collisions[i].data.game) {
							var game = require('./Games/' + collisions[i].data.game);
							if(game.requires) {
								this.Data.Required = game.requires();
							}
						} else if(collisions[i].type == 'door' && collisions[i].data && collisions[i].data.require) {
							if(collisions[i].data.require.job) {
								if(!global.job || global.job.title != collisions[i].data.require.job) {
									this.Data.Required = {
										text: collisions[i].data.require.text
									};
								}
							} else if(collisions[i].data.require.item) {
								if(!global.inventory.Has(collisions[i].data.require.item)) {
									this.Data.Required = {
										text: collisions[i].data.require.text
									};
								}
							} else if(collisions[i].data.require && collisions[i].data.require.text) {
								this.Data.Required = {
									text: collisions[i].data.require.text
								};
							}
						} else if(collisions[i].type == 'auto') {
							var SceneCreator = require('./SceneCreator.js');
							OPgameState.Change(new SceneCreator(collisions[i].data.file, collisions[i].id));
							return 1;
						} else if(collisions[i].Entity && collisions[i].Entity.CanInteract) {
							this.Data.Required = collisions[i].Entity.CanInteract();
						}
						break;
					}
				}

				if(this.Data.Name && !this.Data.bgSprite) {
					this.Data.bgSprite = OP.spriteSystem.Add(this.spriteSystem);
					this.Data.bgSprite.Position.Set(this.Data.size.ScaledWidth / 2.0, this.Data.size.ScaledHeight - 80);
					this.Data.bgSprite.Scale.Set(200, 1);
				}

				if(!this.Data.Name && this.Data.bgSprite) {
					OP.spriteSystem.Remove(this.spriteSystem, this.Data.bgSprite);
					this.Data.bgSprite = null;
				}

				if(!this.Data.Name) {
					this.Data.Required = '';
				}

				if(OP.keyboard.WasPressed(OP.KEY.E) || this.Data.gamePad0.WasPressed(OP.gamePad.Y)) {
						for(var i = 0; i < collisions.length; i++) {

							switch(collisions[i].type) {
								case 'door' : {
									if(collisions[i].data && collisions[i].data.require && collisions[i].data.require.job) {
										if(global.job != collisions[i].data.require.job) {
											global.AudioPlayer.PlayEffect('Audio/Denied.wav');
											continue;
										}
									} else if(collisions[i].data && collisions[i].data.require && collisions[i].data.require.item) {
										if(!global.inventory.Has(collisions[i].data.require.item)) {
											global.AudioPlayer.PlayEffect('Audio/Denied.wav');
											continue;
										}
									}

									                    console.log(collisions[i].logic);
									if(collisions[i].logic) {
										collisions[i].logic();
									}

									if(collisions[i].data.file) {
										global.AudioPlayer.PlayEffect('Audio/Door.wav');
										MixPanel.Track("Opened Door in " + this.Data.scene.data.name, { state: this.Data.scene.data.name, id: collisions[i].id });
										var SceneCreator = require('./SceneCreator.js');
										OPgameState.Change(new SceneCreator(collisions[i].data.file, collisions[i].id));
										return 1;
									} else {
										global.AudioPlayer.PlayEffect('Audio/Denied.wav');
										continue;
									}
								}
								case 'game' : {
									if(this.Data.game) continue;
									console.log('LOADING GAME: ', collisions[i].data.game);
									var game = require('./Games/' + collisions[i].data.game);
									this.Data.game = game(this.Data.scene);
									continue;
								}
								case 'character' : {
									if(this.Data.game) continue;
									if(collisions[i].character) {
										this.Data.game = collisions[i].character.Interact();
										continue;
									}
									continue;
								}
								case 'register' : {
									if(this.Data.game) continue;
									if(this.Data.scene.characters && this.Data.scene.characters[0]) {
										if(collisions[i].Entity && collisions[i].Entity.Interact) {
											this.Data.game = collisions[i].Entity.Interact();
											if(!this.Data.game) {
												global.AudioPlayer.PlayEffect('Audio/Denied.wav');
											}
										}
										continue;
									}
									continue;
								}
								case 'trashcan': {
									var cup = global.inventory.Get('cup');
									if(!cup) continue;

									var self = this;
									var options = [
										{
											text: collisions[i].data.options[0],
											select: function() {
												if(cup) {
													global.game.target = global.game.cash - 0.25;
													if(cup.coffee) {
														global.game.target = global.game.cash - 0.50;
													}
													global.inventory.Remove('cup');
												}
												self.Data.option = null;
											}
										},
										{
											text: collisions[i].data.options[1],
											select: function() {
												self.Data.option = null;
											}
										}
									];
									this.Data.option = new OptionSelector(collisions[i].data.text, options);

									continue;
								}

								default: {
									global.AudioPlayer.PlayEffect('Audio/Denied.wav');
								}

							}

						}
				}

				if(OP.keyboard.WasPressed(OP.KEY.P)) {
					global.tasks.push({
						text: 'Test',
						complete: function() { return global.inventory.Has('apartment-key'); },
						time: -1000
					});
				}

				if(timer.elapsed < 250) {
					for(var i = 0; i < global.tasks.length; i++) {
						if(global.tasks[i].complete()) {
							global.tasks[i].time += timer.elapsed;
							if(global.tasks[i].time > 3000) {
								global.tasks.splice(i, 1);
							}
						} else if(global.tasks[i].time < 0) {
							global.tasks[i].time += timer.elapsed;
						}
					}
				}

				return 0;
		},

		Update: function(timer) {
			var result = this.update(timer);
			if(result == -1) {
				/// Ummm, I'm gonna need you to go ahead come in tomorrow
				console.log('KILLED SCENE');
				return 1;
			} else {
				this.Render();
			}
			return 0;
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
					OP.spriteSystem.Render(this.spriteSystem, this.screenCamera);

					if(this.Data.Name) {
						OP.fontRender.Begin(this.Data.fontManager);
						this.Data.fontManager.SetAlign(OP.FONTALIGN.CENTER);
		      			OP.fontRender.Color(0.9, 0.9, 0.9);
				    	OP.fontRender(this.Data.Name, 1280 / 2.0, 50);
						OP.fontRender.End();
					}

					OP.fontRender.Begin(this.Data.fontManager36);
					this.Data.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
					OP.fontRender.Color(0.9, 0.9, 0.9);
					OP.fontRender('$' + global.wallet.TotalMoney.toFixed(2), 100, this.Data.size.ScaledHeight - 75);
					this.Data.fontManager36.SetAlign(OP.FONTALIGN.RIGHT);
					OP.fontRender(DateAndTime.format(global.time,'h:mm A'), this.Data.size.ScaledWidth - 20, 10);
					OP.fontRender.End();

					if(this.Data.Required) {
						OP.fontRender.Begin(this.Data.fontManager24);
						this.Data.fontManager24.SetAlign(OP.FONTALIGN.CENTER);
						OP.fontRender.Color(0.9, 0, 0);
						OP.fontRender('[ ' + this.Data.Required.text + ' ]', 1280 / 2.0, 100);
						OP.fontRender.End();

					}

					if(global.inventory) {
						global.inventory.Draw();
					}

					OP.fontRender.Begin(this.Data.fontManagerUI);
					this.Data.fontManagerUI.SetAlign(OP.FONTALIGN.LEFT);
					OP.fontRender.Color(0.9, 0.9, 0.9);
					for(var i = 0; i < global.tasks.length; i++) {
						var pos = 20;
						if(global.tasks[i].time < 0) {
							pos += global.tasks[i].time * 0.5;
						}
						if(global.tasks[i].complete()) {
							OP.fontRender.Color(0.0, 0.7, 0.0);
							OP.fontRender('E', pos, 20 + i * 50);
						} else {
							OP.fontRender.Color(0.9, 0.9, 0.9);
							OP.fontRender('D', pos, 20 + i * 50);
						}
					}
					OP.fontRender.End();


					OP.fontRender.Begin(this.Data.fontManager36);
					this.Data.fontManager36.SetAlign(OP.FONTALIGN.LEFT);
					for(var i = 0; i < global.tasks.length; i++) {
						var pos = 20;
						if(global.tasks[i].time < 0) {
							pos += global.tasks[i].time * 0.5;
						}
						OP.fontRender(global.tasks[i].text, pos + 50, 20 + i * 50);
					}
					OP.fontRender.End();

				}


				OP.render.Present();
		},

		Exit: function() {
				//OP.spriteSystem.Destroy(this.spriteSystem);
				// OP.fontManager.Destroy(this.Data.fontManager);
				// OP.physXScene.Destroy(this.Data.physXScene);
				// this.Data.scene.Destroy();
				return 1;
		}

};

// This is in essence a GameState
module.exports = SceneCreator;
