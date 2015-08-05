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

function SceneCreator(file, callingId, opt) {
		this.Data.file = file;
		this.Data.callingId = callingId;
		global.sceneEntered = callingId;
		global.currentScene = this;
		this.Data.nextOpt = opt;
}

SceneCreator.prototype = {
		Data: {

		},

		Initialize: function() {

				OP.render.Depth(1);

				this.Data.game = null;
				this.Data.option = null;

				// Get the gamepad to use
				this.Data.gamePad0 = OP.gamePad.Get(0);

				// Setup the font manager
				this.Data.fontManager = OP.fontManager.Setup('pixel.opf');
				this.Data.fontManager24 = OP.fontManager.Setup('pixel24.opf');
				this.Data.fontManager36 = OP.fontManager.Setup('pixel36.opf');
				this.Data.fontManager72 = OP.fontManager.Setup('pixel72.opf');
				this.Data.fontManagerUI = OP.fontManager.Setup('ui.opf');


				// Create the initial scene with a default gravity of -9.8
				var vec3 = OP.vec3.Create(0,0,0);
				vec3.Set(0,-9.8,0);
				this.Data.physXScene = OP.physXScene.Create(vec3);
				OP.free(vec3);

				// Create a base material to use through out the scene
				this.Data.physXmaterial = OP.physX.CreateMaterial(0.8, 0.8, 0.6);

				// Load up the scene from the json file
				this.Data.scene = new SceneLoader(this.Data.physXScene, this.Data.file);
				this.name = this.Data.scene.name;
				this.Data.scene.LoadCharacters('Scenes/Characters.json');

				// Get the location to spawn the player at based on an id in the positions of the json data
				var start = null;
				if(this.Data.callingId) {
						start = this.Data.scene.FindPosition(this.Data.callingId);
				}

				// Create the Player
				this.Data.player = new Player(this.Data.scene.scale, this.Data.physXScene, this.Data.physXmaterial, start, this.Data.scene);

				global.player = this.Data.player;

				this.Data.arrowMesh = BuildVoxelMesh('Arrow.qb');
				this.Data.arrowModel = OP.model.Create(this.Data.arrowMesh);

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
				sprites.push(OP.cman.Get(sheet + '/Hunger-iso'));

			  	this.Data.size = OP.render.Size();
				this.spriteSystem = OP.spriteSystem.Create(sprites, 12, OP.SPRITESYSTEMALIGN.CENTER);
				if(!global.spriteSystemFood) {
					global.spriteSystemFood = OP.spriteSystem.Create(sprites, 12, OP.SPRITESYSTEMALIGN.CENTER);
				}
			this.screenCamera = OP.cam.Ortho(0, 0, 10, 0, 0, 0, 0, 1, 0, 0.1, 20.0, 0, this.Data.size.ScaledWidth, 0, this.Data.size.ScaledHeight);

				this.Data.bgSprite = null;

				this.Data.dollar = OP.spriteSystem.Add(this.spriteSystem);
				this.Data.dollar.Position.Set(100, 50);
				OP.spriteSystem.SetSprite(this.Data.dollar, 1);

				if(!global.inventory.Has('diploma')) {
					var diploma = JSON('Scenes/Items/Diploma.json');
					global.inventory.Add(diploma.key, diploma.data);
				}

				if(!global.hunger) {
					global.hunger = [];
					global.hungerAmount = 0;
					this.resetHunger();
				}


				if(!global.inventory.Has('phone')) {
					var cell = JSON('Scenes/Items/CellPhone.json');
					var phone = global.inventory.Add(cell.key, cell.data);
					phone.Entity = new (require('./Objects/CellPhone.js'));
				}


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

				this.Data.color = [ 1, 1, 1];

				return 1;
		},

		resetHunger: function() {
			for(var i = 0; i < global.hunger; i++) {
				OP.spriteSystem.Remove(global.spriteSystemFood, global.hunger[i]);
			}
			global.hunger = [];
			for(var i = 0; i < 4; i++) {
				this.AddAHunger(true);
			}
		},

		removeAHunger: function() {
			global.hungerAmount = 0;
			if(global.hunger.length < 1) {
				return false;
			}

			if(global.hunger.length == 2) {
				this.Data.option = new OptionSelector('I\'m so hungry. I need to eat soon.', null);
			}

			var pos = global.hunger.length - 1;
			OP.spriteSystem.Remove(global.spriteSystemFood, global.hunger[pos]);
			global.hunger.splice(pos, 1);

			return true;
		},

		AddAHunger: function(init) {
			if(global.hunger.length > 7) {
				global.AudioPlayer.PlayEffect('Audio/Denied.wav');
				return false;
			}
			if(!init) {
				global.AudioPlayer.PlayEffect('Audio/Nom.ogg');
			}

			var hunger = OP.spriteSystem.Add(global.spriteSystemFood);
			hunger.Position.Set(this.Data.size.ScaledWidth - 50 - 50 * (global.hunger.length), 50);
			OP.spriteSystem.SetSprite(hunger, 2);
			global.hunger.push(hunger);

			global.hungerAmount = 0;

			return true;
		},

		update: function(timer) {
			this.Data.gamePad0 = OP.gamePad.Get(0);

			if(timer.elapsed > 500 || timer.elapsed == 0) return 1;

			timer.actualElapsed = timer.elapsed;



			if(this.Data.game) {
				var result = this.Data.game.Update(timer, this.Data.gamePad0);
				if(result.result == -1) {
					return -1;
				}
				if(result.result == -2) {
					return -2;
				}
				if(result.result) {
					this.Data.game.Exit && this.Data.game.Exit();
					this.Data.game = result.next;
				}
				return 0;
			}

			if(this.Data.option) {
				// Getting a selection
				var result = this.Data.option.Update(this.Data.gamePad0);
				if(result && result.result) {
					this.Data.option = null;
					return 0;
				} else {
					return 0;
				}
			}

			var aliveCharacters = 0;
			for(var i = 0; i < this.Data.scene.characters.length; i++) {
				aliveCharacters += this.Data.scene.characters[i].alive;
			}

			if(Input.IsSpeedDown(this.Data.gamePad0) || (global.job && global.job.clocked && aliveCharacters == 0)) { //
				global.timeScale = 100;
				timer.scaled = 8;
			} else if(Input.IsSlowDown(this.Data.gamePad0)) { //
				global.timeScale = 1;
				timer.scaled = 1;
			} else {
				//if(global.tasks.length == 0) {
					global.timeScale = 8;
					timer.scaled = 2;
				// } else {
				// 	global.timeScale = 4;
				// 	timer.scaled = 1;
				// }
			}

			if(this.Data.scene.Logic(this, timer)){
				return 1;
			}

            if(global.job && global.job.clocked) {
                global.job.time += timer.elapsed * global.timeScale * 10;
            }

			if(global.job && global.time.getHours() >= global.job.activeSchedule.end) {
				global.job.clocked = false;
			}

			var beforeAddingHour = global.time.getHours();
			global.time = DateAndTime.addMilliseconds(global.time, timer.elapsed * global.timeScale * 10);
			var afterAddingHour = global.time.getHours();

			if(beforeAddingHour == 23 && afterAddingHour == 0) {
				global.wallet.AddExpense('Mugged', 'mugged', 50);
				global.journal.unshift({
					text: 'I was mugged and lost $50',
					dt: global.time
				});
				var game = require('./Games/EndOfDay.js');
				this.Data.game = game(this.Data.scene, true);
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



			if(!global.win && global.days == global.EndDay) {
				global.win = true;
				var SceneCreator = require('./SceneCreator.js');
				OPgameState.Change(new SceneCreator('Scenes/Street.json', 110));
				return 1;
			}

			if(global.win) {
				if(this.Data.colorTime == undefined || this.Data.colorTime == null)
					this.Data.colorTime = 200;
				this.Data.colorTime -= timer.elapsed;
				if(this.Data.colorTime < 0) {
					this.Data.colorTime = 200;
					this.Data.color = [Math.random(),Math.random(),Math.random()];
				}
			}

			var beforeScaleElapsed = timer.elapsed;

			timer.elapsed *= global.timeScale;
			OP.timer.SetElapsed(timer, timer.elapsed);
			global.hungerAmount += timer.elapsed;

			// Remove 1 every 3 hours
			var hungerMax = 1000 * 60 * 6 * 3;
			if(global.hungerAmount > hungerMax) {
				if(!this.removeAHunger()) {
					var game = require('./Games/GameOver.js');
					this.Data.game = game(this.Data.scene, ['You\'ve starved. You failed to take care of yourself.', 'At least you still have your parents basement.']);
					return 0;
				}
			}


				if (Input.WasBackPressed(this.Data.gamePad0))  {
					var game = require('./Games/InventoryViewer.js');
					this.Data.game = game();
					return 0;
				}

				// Toggle between driving the character and driving the camera
				if (this.Data.gamePad0.WasPressed(OP.gamePad.START) || OP.keyboard.WasPressed(OP.KEY.ENTER))  {
					this.Data.camera.ToggleControl();
				}

				if (!this.Data.camera.freeForm) {
					this.Data.player.Update(timer, this.Data.gamePad0);
				}


				for(var i = 0; i < this.Data.scene.characters.length; i++) {
					this.Data.scene.characters[i].Update(timer, this.Data.scene);
				}


				OP.physXScene.Update(this.Data.physXScene, timer);

				for(var i = 0; i < this.Data.scene.characters.length; i++) {
					this.Data.scene.characters[i].Move(timer);
				}
				this.Data.player.Move(timer);

				if (this.Data.camera.freeForm) {
					var tmp = timer.elapsed;
					timer.elapsed = beforeScaleElapsed;
					OP.timer.SetElapsed(timer, timer.elapsed);
					this.Data.camera.Update(timer);
					timer.elapsed = tmp;
					OP.timer.SetElapsed(timer, timer.elapsed);
				} else {
					this.Data.camera.Update(timer);
				}

				this.Data.camera.LookAt(this.Data.player);

				// if(!global.started) {
				// 	var game = require('./Games/InventoryViewer.js');
				// 	this.Data.game = game();
				// 	return 0;
				// }

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
					OP.spriteSystem.SetSprite(this.Data.bgSprite, 0);
				}

				if(!this.Data.Name && this.Data.bgSprite) {
					OP.spriteSystem.Remove(this.spriteSystem, this.Data.bgSprite);
					this.Data.bgSprite = null;
				}

				if(!this.Data.Name) {
					this.Data.Required = '';
				}

				if(Input.WasActionPressed(this.Data.gamePad0)) {
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

									var opt = null;
									if(collisions[i].logic) {
										var result = collisions[i].logic(collisions[i]);
										if(result && result.result) {
											this.Data.option = result.next;
											return 0;
										} else if( result && result.result == 0) {
											opt = result.next;
										}
									}

									if(collisions[i].data.file) {
										global.AudioPlayer.PlayEffect('Audio/Door.wav');
										MixPanel.Track("Opened Door in " + this.Data.scene.data.name, { state: this.Data.scene.data.name, id: collisions[i].id });
										var SceneCreator = require('./SceneCreator.js');
										var next = new SceneCreator(collisions[i].data.file, collisions[i].id, opt);
										OPgameState.Change(next);
										return 1;
									} else {
										global.AudioPlayer.PlayEffect('Audio/Denied.wav');
										continue;
									}
								}
								case 'game' : {
									if(this.Data.game) continue;
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
													if(cup.coffee) {
														global.wallet.AddExpense(cup.type + ' ' + cup.coffee.type + ' Coffee', 'cup', 0.50);
													} else {
														global.wallet.AddExpense(cup.type + ' Cup', 'cup', 0.25);
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
								case 'trashbag': {
									var self = this;
									var options = [
										{
											text: 'Ugh... yes.',
											select: function() {
												var r = Math.random();
												if(r > 0.75) {
												      global.inventory.Add('sandwich', {
												          id: 'sandwich',
												          type: 'food',
												          sheet: 'CoffeeSelector',
												          item: 'HalfEatenSandwich-iso',
												          text: 'Half Eaten Sandwich',
												          desc: [ 'It\s from the garbage, but it looks edible', '[ Fills 1 hunger ]', '1 bite remains' ],
														  Entity: {
											                  Interact: function() {
											                      global.currentScene.AddAHunger();
																  return true;
											                  }
											              }
												      });
													self.Data.option = new OptionSelector('Found a half eaten sandwich!', null);
												} else {
													self.Data.option = new OptionSelector('Didn\'t find anything. So gross.', null);
												}
											}
										},
										{ text: 'Not a chance.' }
									];
									this.Data.option = new OptionSelector('Should I search the trash?', options);

									break;
								}
								case 'item': {
									if(collisions[i].data.file) {
						            	global.AudioPlayer.PlayEffect('Audio/Selection.wav');
										var key = JSON('Scenes/Items/' + collisions[i].data.file);
										global.inventory.Add(key.key, key.data);
									}
									break;
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

				for(var i = 0; i < global.tasks.length; i++) {
					if(global.tasks[i].done || global.tasks[i].time < 0) {
						global.tasks[i].time += timer.actualElapsed;
					}

					if(global.tasks[i].time > 3000) {
						global.tasks.splice(i, 1);
						continue;
					}

					if(global.tasks[i].update) {
						var result = global.tasks[i].update();
						if(result && result.result == 2) {
							this.Data.game = result.next;
							return 0;
						}
						if(result && result.result && result.next) {
							this.Data.option = result.next;
						}
					}

					if(global.tasks[i].complete && global.tasks[i].complete()) {
						global.tasks[i].done = true;
					}

					if(global.tasks[i].failed && global.tasks[i].failed()) {
						global.tasks[i].done = true;
					}
				}

				global.inventory.UpdateItems(timer, this.Data.gamePad0);

				for(var i = 0; i < global.tasks.length; i++) {
					global.tasks[i].scaleTime = global.tasks[i].scaleTime || 0;
					global.tasks[i].scaleTime += timer.elapsed;
				}

				if(global.announcement && global.announcement.time <= 0) {
					global.announcement = null;
				} else if(global.announcement) {
					global.announcement.time -= timer.actualElapsed;
				}

				if(this.Data.nextOpt) {
					this.Data.option = this.Data.nextOpt;
					this.Data.nextOpt = null;
				}

				return 0;
		},

		Update: function(timer) {
			var result = this.update(timer);
			if(result == -1) {
				return 1;
			} else if(result == 1) {
				return 0;
			} else if(result == -2) {
				var MainMenu = require('./MainMenu.js');
				OPgameState.Change(new MainMenu());
				return 0;
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


				for(var i = 0; i < global.tasks.length; i++) {
					if(global.tasks[i].location) {
						var r = global.tasks[i].location();
						if(!r) continue;


						//this.Data.arrowModel.world.SetScl(250, 250, 250);
						this.Data.arrowModel.world.SetTranslate(r.pos[0], r.pos[1], r.pos[2]);
						var time = global.tasks[i].scaleTime % 5000.0;
						if(time > 2500) time = 2500 - (time - 2500);

						this.Data.arrowModel.world.Scl((r.startScale || 0.5) + (r.scale || 1.0) * ((time) / 10000.0));
						this.Data.arrowModel.world.RotY(r.rotateY || 0);
						this.Data.arrowModel.world.RotZ(r.rotateZ || 0);

						OP.model.Draw(this.Data.arrowModel, this.Data.material, this.Data.camera.Camera());
					}
				}



				if(this.Data.option) {
					this.Data.option.Render(this.Data.fontManager);
				} else {
					if(global.announcement) {
						console.log('Announce', announcement);
						OP.fontRender.Begin(this.Data.fontManager72);
						this.Data.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
		      			OP.fontRender.Color(0.9, 0.9, 0.9);
				    	OP.fontRender(global.announcement.text, 1280 / 2.0, 100);
						OP.fontRender.End();
					}
				}



				if(this.Data.game) {
					this.Data.game.Draw();
				} else {
					OP.spriteSystem.Render(this.spriteSystem, this.screenCamera);
					OP.spriteSystem.Render(global.spriteSystemFood, this.screenCamera);

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

					if(global.wallet.Last) {
						if(global.wallet.Last.type == 'expense') {
							OP.fontRender.Color(1.0, 0.0, 0.0);
							OP.fontRender('- $' + global.wallet.Last.amount.toFixed(2), 100, this.Data.size.ScaledHeight - 130);
						} else {
							OP.fontRender.Color(0.0, 0.8, 0.0);
							OP.fontRender('+ $' + global.wallet.Last.amount.toFixed(2), 100, this.Data.size.ScaledHeight - 130);
						}
					}

					this.Data.fontManager36.SetAlign(OP.FONTALIGN.RIGHT);
					OP.fontRender.Color(1.0, 1.0, 1.0);
					OP.fontRender(DateAndTime.format(global.time,'E MMM DD YYYY'), this.Data.size.ScaledWidth - 20, 10);
					OP.fontRender(DateAndTime.format(global.time,'h:mm A'), this.Data.size.ScaledWidth - 20, 40);
					OP.fontRender.End();

					if(global.job && global.job.clocked) {
						OP.fontRender.Begin(this.Data.fontManager24);
						this.Data.fontManager24.SetAlign(OP.FONTALIGN.RIGHT);
						OP.fontRender.Color(0, 0.8, 0);
						OP.fontRender('Working', this.Data.size.ScaledWidth - 20, 80);

						var seconds = global.job.time / 1000;
						var minutes = seconds / 60;
						var hours = minutes / 60;
						OP.fontRender(hours.toFixed(2) + ' hours', this.Data.size.ScaledWidth - 20, 100);
						OP.fontRender.End();
					}


					if(this.Data.Required) {
						OP.fontRender.Begin(this.Data.fontManager24);
						this.Data.fontManager24.SetAlign(OP.FONTALIGN.CENTER);
						OP.fontRender.Color(0.9, 0, 0);
						OP.fontRender('[ ' + this.Data.Required.text + ' ]', 1280 / 2.0, 100);
						OP.fontRender.End();

					}

					if(global.win && this.name == 'Street') {
						OP.fontRender.Begin(this.Data.fontManager);
						this.Data.fontManager.SetAlign(OP.FONTALIGN.CENTER);
						OP.fontRender.Color(1,1,1);
						OP.fontRender('You won!', 1280 / 2.0, 720 / 4.0);
						OP.fontRender.Color(this.Data.color[0], this.Data.color[1], this.Data.color[2]);
						OP.fontRender('You survived ' + (global.EndDay - 1) + ' days out of college!', 1280 / 2.0, 720 / 3.0);
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
						} else if(global.tasks[i].failed && global.tasks[i].failed()) {
							OP.fontRender.Color(1.0, 0.0, 0.0);
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
