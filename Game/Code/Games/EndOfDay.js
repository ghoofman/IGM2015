var OP = require('OPengine').OP;
var Input = require('../Utils/Input.js'),
    OptionSelector = require('../Utils/OptionSelector.js');

function EndOfDay(scene, shouldNotAsk) {

    this.scene = scene;

    this.fontManager = OP.fontManager.Setup('pixel.opf');
    this.fontManager24 = OP.fontManager.Setup('pixel24.opf');
    this.fontManager72 = OP.fontManager.Setup('pixel72.opf');
	this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
	this.background.Scale.Set(2, 2);

	// The basic effect to use for all rendering (for now)
	this.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', global.player.mesh.VertexSize);

	// The base material to use for all rendering (for now)
	this.material = OP.material.Create(this.effect);

	this.size = OP.render.Size();
	this.camera = OP.cam.Ortho(0, 0, -100, 0, 0, 0, 0, 1, 0, 0.1,250.0, 0, this.size.ScaledWidth, 0, this.size.ScaledHeight);

	var sheet = 'BaseSelector';
	OP.cman.Load(sheet + '.opss');

	var selectorSprites = [];
	selectorSprites.push(OP.cman.Get(sheet + '/Action'));
	selectorSprites.push(OP.cman.Get(sheet + '/ActionOff'));
	selectorSprites.push(OP.cman.Get(sheet + '/ActionPush'));
	selectorSprites.push(OP.cman.Get(sheet + '/ProgressBackground'));

	this.spriteSystem = OP.spriteSystem.Create(selectorSprites, 2, OP.SPRITESYSTEMALIGN.BOTTOM_CENTER);

	var titleBg = OP.spriteSystem.Add(this.spriteSystem);
	titleBg.Position.Set(this.size.ScaledWidth / 2.0, 0);
	titleBg.Scale.Set(1000, 1);
	OP.spriteSystem.SetSprite(titleBg, 3);


	this.btn = OP.spriteSystem.Add(this.spriteSystem);
	this.btn.Position.Set(this.size.ScaledWidth - 100, 10);


    this.state = 0;

    function addWalletLines() {
        global.wallet.AddWalletLines();
    }

    if(shouldNotAsk) {
        addWalletLines();
    } else {
        var self = this;
        this.option = new OptionSelector('Ready to end the day?', [
        { text: 'Not yet.', select: function() {
            self.end = true;
            return {
                result: 1
            };
        }},
        { text: 'Ready for bed.', select: function() {
            self.option = null;

            addWalletLines();

            return {
                result: 0
            };
        }}
        ]);
    }

    this.wallet = global.wallet;

    this.end = false;
}

EndOfDay.prototype = {
    state: 0,

	Update: function(timer, gamepad) {
        if(this.end) {
            return {
                result: 1
            };
        }

        if(this.option) {
            return this.option.Update(gamepad);
        }

        if(Input.WasActionPressed(gamepad) || Input.WasBackPressed(gamepad)) {

            if(this.state == 2) {
                if(this.scene) {
                    this.scene.EndOfDay();
                }
                // Clear out any temporary ai data for the day
                // Note global.memory is still there for long term ai data
                global.ai = {};
                global.tasks = [];

                var self = this;
                if(global.job) {
                    global.tasks.push( {
                		text: 'Get to work',
                        location: function() {
                            if(global.currentScene.name == 'Street') {
                                return {
                                    pos: [210, 40, -50],
                                    startScale: 0.5,
                                    scale: 1.0,
                                    rotateY: 0,
                                    rotateZ: 0
                                };
                            }
                            if(global.currentScene.name == 'Cafe' && !global.job.clocked) {
                                return {
                                    pos: [-180, 40, 0],
                                    startScale: 0.5,
                                    scale: 1.0,
                                    rotateY: 0,
                                    rotateZ: 3.14
                                };
                            }

                            return null;
                        },
                        update: function() {
                            if(global.job && global.job.clocked) return;

                            // There is a job
                            if(global.job && global.job.activeSchedule) {
                                // Check if we've passed the start time
                    			if(global.time.getHours() >= global.job.activeSchedule.start) {
                    				global.job = null;
                                    global.inventory.Remove('cafe-key');


        							var game = require('./GameOver.js');
                                    return {
                                        result: 2,
                                        next: game(global.currentScene, ['You couldn\'t even hold down a job.', 'Time to hide away in your parents basement for all of eternity.'])
                                    };
                    			}

                                if(global.time.getHours() == global.job.activeSchedule.start - 1 &&
                                    global.time.getMinutes() == 50 && !this.alerted) {
                                        this.alerted = true;
                                        return {
                                            result: 1,
                                            next: new OptionSelector('If I don\'t hurry I\'m going to be late for work')
                                        };
                                }

                            }

                            return {
                                result: 0
                            };
                        },
                		complete: function() { return global.job && global.job.clocked; },
                		failed: function() { return !global.job; },
                		time: -1000
                	});
                    global.job.activeSchedule = global.job.schedule[0];
                }

                global.announcement = {
                    time: 2000,
                    text: 'Survived Day ' + global.days
                };

                global.wallet.CompleteDay();
                global.days++;

                global.time = new Date();
                global.time.setHours(8);
                global.time.setMinutes(0);
                global.time.setSeconds(0);
                global.time.setMilliseconds(0);

                if(global.job) {
                    global.job.time = 0;
                }

                global.currentScene.removeAHunger();

                if(global.wallet.cash < 0) {
                    var game = require('./GameOver.js');
        			return {
        				result: 1,
                        next: game(this.scene)
        			};
                }
    			return {
    				result: 1
    			}
            } else {
                this.state++;
            }
		}

		return {
			result: 0
		};
	},

    _DrawIncome: function() {

        OP.fontRender.Begin(this.fontManager);
        this.fontManager.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(0.0, 0.8, 0.0);
        OP.fontRender('>  Income Today  <', this.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();


        OP.fontRender.Begin(this.fontManager24);

        this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender.Color(0.0, 0.8, 0);

        var posY = 150;
        var total = 0;
		var offsetX = 0;

		// Draw the non-info lines
        for(var i = 0; i < this.wallet.lines.length; i++) {
            total += this.wallet.lines[i].amount;
            this.fontManager24.SetAlign(OP.FONTALIGN.RIGHT);
            var offset = 0;
            if(this.wallet.lines[i].info) {
                continue;
            } else {
                OP.fontRender.Color(0.0, 0.8, 0);
            }

            OP.fontRender(this.wallet.lines[i].name, offsetX + 550 + offset, posY);

            this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            OP.fontRender('$' + this.wallet.lines[i].amount.toFixed(2), offsetX + 600 + offset, posY);

            if(this.wallet.lines[i].desc) {
                OP.fontRender(this.wallet.lines[i].desc, offsetX + 800 + offset, posY);
            }

            posY += 35;
        }

        this.fontManager24.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Total', offsetX + 550, 600);
        this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + total.toFixed(2), offsetX + 600, 600);

        OP.fontRender.End();


        OP.fontRender.Begin(this.fontManager24);
        var posY = 150;

		// Draw the info lines
        for(var i = 0; i < this.wallet.lines.length; i++) {

            this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            var offset = 50;
            if(!this.wallet.lines[i].info) {
                //posY += 35;
                continue;
            } else {
                OP.fontRender.Color(1.0, 1.0, 1.0);
            }

            if(this.wallet.lines[i].amount) {
                OP.fontRender('$' + this.wallet.lines[i].amount.toFixed(2) + ' ' + this.wallet.expenses[i].name, offsetX + 800, posY);
            } else {
                OP.fontRender(this.wallet.lines[i].name, offsetX + 600, posY);
            }

            posY += 35;
        }

        OP.fontRender.End();

    },

    _DrawExpenses: function() {

        OP.fontRender.Begin(this.fontManager);
        this.fontManager.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(1.0, 0.0, 0.0);
        OP.fontRender('>  Expenses Today  <', this.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();


        OP.fontRender.Begin(this.fontManager24);

        this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender.Color(1.0, 0, 0);

        var posY = 150;
        var total = 0;
		var offsetX = 0;
        for(var i = 0; i < this.wallet.expenses.length; i++) {
            total += this.wallet.expenses[i].amount;
            this.fontManager24.SetAlign(OP.FONTALIGN.RIGHT);
            var offset = 0;
            if(this.wallet.expenses[i].info) {
                continue;
            }

			OP.fontRender.Color(1.0, 0, 0);
            OP.fontRender(this.wallet.expenses[i].name, offsetX + 550 + offset, posY);

            this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            OP.fontRender('$' + this.wallet.expenses[i].amount.toFixed(2), offsetX + 600 + offset, posY);

            if(this.wallet.expenses[i].desc) {
                OP.fontRender.Color(1.0, 1.0, 1.0);
                OP.fontRender(this.wallet.expenses[i].desc, offsetX + 800 + offset, posY);
            }

            posY += 35;
        }

        this.fontManager24.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Total', offsetX + 550, 600);
        this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + total.toFixed(2), offsetX + 600, 600);

        OP.fontRender.End();


        OP.fontRender.Begin(this.fontManager24);
        var posY = 150;
        for(var i = 0; i < this.wallet.expenses.length; i++) {

            this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            var offset = 50;
            if(!this.wallet.expenses[i].info) {
                posY += 35;
                continue;
            } else {
                OP.fontRender.Color(1.0, 1.0, 1.0);
            }

            if(this.wallet.expenses[i].amount) {
                OP.fontRender('$' + this.wallet.expenses[i].amount.toFixed(2) + ' ' + this.wallet.expenses[i].name, offsetX + 800, posY);
            } else {
                OP.fontRender(this.wallet.expenses[i].name, offsetX + 800, posY);
            }

			posY += 35;
            //posY += 35;
        }

        OP.fontRender.End();

    },

    _DrawNet: function() {

        OP.fontRender.Begin(this.fontManager);
        this.fontManager.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(1.0, 1.0, 1.0);
        OP.fontRender('>  Result  <', this.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();

		var offsetX = 0;

        OP.fontRender.Begin(this.fontManager24);

        this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);

        this.fontManager24.SetAlign(OP.FONTALIGN.RIGHT);
        var diff = this.wallet.Income() - this.wallet.Expenses();
        OP.fontRender.Color(0.0, 0.8, 0.0);
        OP.fontRender("Cash", offsetX + 550, 150);
        OP.fontRender("Income", offsetX + 550, 200);
        if(diff >= 0) {
            OP.fontRender("Gain", offsetX + 550, 300);
        }
        OP.fontRender.Color(1.0, 0.0, 0.0);
        OP.fontRender("Expenses", offsetX + 550, 250);
        if(diff < 0) {
            OP.fontRender("Loss", offsetX + 550, 300);
        }

        OP.fontRender("Student Loan Balance", offsetX + 550, 400);

        this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender.Color(0.0, 0.8, 0.0);
        OP.fontRender('$' + this.wallet.cash.toFixed(2), offsetX + 600, 150);
        OP.fontRender('$' + this.wallet.Income().toFixed(2), offsetX + 600, 200);
        OP.fontRender.Color(1.0, 0.0, 0.0);
        OP.fontRender('-$' + this.wallet.Expenses().toFixed(2), offsetX + 600, 250);
        OP.fontRender('-$' + this.wallet.loans.toFixed(2), offsetX + 600, 400);

        if(diff >= 0) {
            OP.fontRender.Color(0.0, 0.8, 0.0);
            OP.fontRender('$' + diff.toFixed(2), offsetX + 600, 300);
        } else {
            OP.fontRender.Color(1.0, 0.0, 0.0);
            OP.fontRender('-$' + Math.abs(diff).toFixed(2), offsetX + 600, 300);
        }


        var result = this.wallet.Total();

        if(result < 0) {
            OP.fontRender.Color(1.0, 0.0, 0.0);
        } else {
            OP.fontRender.Color(0.0, 0.8, 0.0);
        }
        this.fontManager24.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Cash', offsetX + 550, 600);
        this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + result.toFixed(2), offsetX + 600, 600);

        OP.fontRender.End();
    },

	Draw: function() {
        if(this.option) {
            this.option.Render();
            return;
        }

        // Draw background fade
        OP.texture2D.Render(this.background);

        // Draw edges
        OP.spriteSystem.Render(this.spriteSystem, this.camera);

        switch(this.state) {
            case 0: {
                this._DrawIncome();
                break;
            }
            case 1: {
                this._DrawExpenses();
                break;
            }
            case 2: {
                this._DrawNet();
                break;
            }
        }

        OP.render.Depth(1);
        OP.render.DepthWrite(1);
        global.player.DrawPos([-100,140,-40], [0.3, -0.7], 6, this.material, this.camera);

	},

	Exit: function() {

	}

};

module.exports = function(scene, shouldNotAsk) {
	return new EndOfDay(scene, shouldNotAsk);
}
