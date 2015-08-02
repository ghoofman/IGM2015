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
        var interest = global.wallet.loans * (0.04 / 365.0);

        global.wallet.AddExpense('Student Loan Payment', 'loan', 10, 300, 'mo');
        global.wallet.AddExpenseInfo('Principal', 'loan', 10 - interest);
        global.wallet.AddExpenseInfo('Interest', 'loan', interest);
        global.wallet.loans -= 10 - interest;

        global.wallet.AddExpense('Cell Phone Plan', 'cell', 2, 60, 'mo');

        if(global.apartment) {
            global.wallet.AddExpense('Apartment Rent', 'rent', global.apartment.rent, global.apartment.rate * 30, 'mo');
        }

        if(global.job) {
            var rate = global.job.rate || 8;
            var totalTime = global.job.time || 0;
            var seconds = totalTime / 1000;
            var minutes = seconds / 60;
            var hours = minutes / 60.0;
            global.wallet.AddIncome('Cafe Pay Check', 'pay', hours * rate, rate, 'hr');
            global.wallet.AddIncomeInfo(hours.toFixed(2) + ' hours worked', 'pay', 0);
            global.wallet.AddExpense('Federal Taxes', 'tax', (hours * rate) * 0.20);
            global.wallet.AddExpenseInfo('20% of Pay Check', 'tax', 0);
            global.wallet.AddExpense('State Taxes', 'tax', (hours * rate) * 0.13);
            global.wallet.AddExpenseInfo('13% of Pay Check', 'tax', 0);
        }
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
                global.ai = {};
                var self = this;
                if(global.job) {
                    global.tasks.push( {
                		text: 'Get to work',
                		complete: function() { return global.job && global.job.clocked; },
                		failed: function() { return !global.job; },
                		time: -1000
                	});
                    global.job.activeSchedule = global.job.schedule[0];
                }

                global.wallet.CompleteDay();

                global.time = new Date();
                global.time.setHours(8);
                global.time.setMinutes(0);
                global.time.setSeconds(0);
                global.time.setMilliseconds(0);

                if(global.job) {
                    global.job.time = 0;
                }

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

        OP.fontRender.Begin(this.fontManager72);
        this.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(0.0, 0.8, 0.0);
        OP.fontRender('Income for Today', this.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();


        OP.fontRender.Begin(this.fontManager);

        this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender.Color(0.0, 0.8, 0);

        var posY = 150;
        var total = 0;
        for(var i = 0; i < global.wallet.lines.length; i++) {
            total += global.wallet.lines[i].amount;
            this.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
            var offset = 0;
            if(global.wallet.lines[i].info) {
                posY += 35;
                continue;
                OP.fontRender.Color(1.0, 1.0, 1.0);
            } else {
                OP.fontRender.Color(0.0, 0.8, 0);
            }

            OP.fontRender(global.wallet.lines[i].name, 550 + offset, posY);

            this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
            OP.fontRender('$' + global.wallet.lines[i].amount.toFixed(2), 600 + offset, posY);

            if(global.wallet.lines[i].rate) {
                OP.fontRender('$' + global.wallet.lines[i].rate.toFixed(2) + ' / ' + global.wallet.expenses[i].rateScale, 800 + offset, posY);
            }

            posY += 50;
        }

        this.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Total', 550, 600);
        this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + total.toFixed(2), 600, 600);

        OP.fontRender.End();


        OP.fontRender.Begin(this.fontManager24);
        var posY = 160;
        for(var i = 0; i < global.wallet.lines.length; i++) {

            this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            var offset = 50;
            if(!global.wallet.lines[i].info) {
                posY += 50;
                continue;
            } else {
                OP.fontRender.Color(1.0, 1.0, 1.0);
            }

            if(global.wallet.lines[i].amount) {
                OP.fontRender('$' + global.wallet.lines[i].amount.toFixed(2) + ' ' + global.wallet.expenses[i].name, 600, posY);
            } else {
                OP.fontRender(global.wallet.lines[i].name, 600, posY);
            }
            // this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            // OP.fontRender('$' + global.wallet.expenses[i].amount.toFixed(2) + ' )', 600, posY);
            //
            // if(global.wallet.expenses[i].rate) {
            //     OP.fontRender('$' + global.wallet.expenses[i].rate.toFixed(2) + ' / hr', 800, posY);
            // }

            posY += 35;
        }

        OP.fontRender.End();

    },

    _DrawExpenses: function() {

        OP.fontRender.Begin(this.fontManager72);
        this.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(1.0, 0.0, 0.0);
        OP.fontRender('Expenses Today', this.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();


        OP.fontRender.Begin(this.fontManager);

        this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender.Color(1.0, 0, 0);

        var posY = 150;
        var total = 0;
        for(var i = 0; i < global.wallet.expenses.length; i++) {
            total += global.wallet.expenses[i].amount;
            this.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
            var offset = 0;
            if(global.wallet.expenses[i].info) {
                posY += 35;
                continue;
                OP.fontRender.Color(1.0, 1.0, 1.0);
            } else {
                OP.fontRender.Color(1.0, 0, 0);
            }

            OP.fontRender(global.wallet.expenses[i].name, 550 + offset, posY);

            this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
            OP.fontRender('$' + global.wallet.expenses[i].amount.toFixed(2), 600 + offset, posY);

            if(global.wallet.expenses[i].rate) {
                OP.fontRender('$' + global.wallet.expenses[i].rate.toFixed(2) + ' / ' + global.wallet.expenses[i].rateScale, 800 + offset, posY);
            }

            posY += 50;
        }

        this.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Total', 550, 600);
        this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + total.toFixed(2), 600, 600);

        OP.fontRender.End();


        OP.fontRender.Begin(this.fontManager24);
        var posY = 160;
        for(var i = 0; i < global.wallet.expenses.length; i++) {

            this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            var offset = 50;
            if(!global.wallet.expenses[i].info) {
                posY += 50;
                continue;
            } else {
                OP.fontRender.Color(1.0, 1.0, 1.0);
            }

            if(global.wallet.expenses[i].amount) {
                OP.fontRender('$' + global.wallet.expenses[i].amount.toFixed(2) + ' ' + global.wallet.expenses[i].name, 600, posY);
            } else {
                OP.fontRender(global.wallet.expenses[i].name, 600, posY);
            }
            // this.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            // OP.fontRender('$' + global.wallet.expenses[i].amount.toFixed(2) + ' )', 600, posY);
            //
            // if(global.wallet.expenses[i].rate) {
            //     OP.fontRender('$' + global.wallet.expenses[i].rate.toFixed(2) + ' / hr', 800, posY);
            // }

            posY += 35;
        }

        OP.fontRender.End();

    },

    _DrawNet: function() {

        OP.fontRender.Begin(this.fontManager72);
        this.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(1.0, 1.0, 1.0);
        OP.fontRender('Result Today', this.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();

        OP.fontRender.Begin(this.fontManager);

        this.fontManager.SetAlign(OP.FONTALIGN.LEFT);

        this.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
        var diff = global.wallet.Income() - global.wallet.Expenses();
        OP.fontRender.Color(0.0, 0.8, 0.0);
        OP.fontRender("Cash", 550, 150);
        OP.fontRender("Income", 550, 200);
        if(diff >= 0) {
            OP.fontRender("Gain", 550, 300);
        }
        OP.fontRender.Color(1.0, 0.0, 0.0);
        OP.fontRender("Expenses", 550, 250);
        if(diff < 0) {
            OP.fontRender("Loss", 550, 300);
        }

        OP.fontRender("Student Loans", 550, 400);

        this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender.Color(0.0, 0.8, 0.0);
        OP.fontRender('$' + global.wallet.cash.toFixed(2), 600, 150);
        OP.fontRender('$' + global.wallet.Income().toFixed(2), 600, 200);
        OP.fontRender.Color(1.0, 0.0, 0.0);
        OP.fontRender('-$' + global.wallet.Expenses().toFixed(2), 600, 250);
        OP.fontRender('-$' + global.wallet.loans.toFixed(2), 600, 400);

        if(diff >= 0) {
            OP.fontRender.Color(0.0, 0.8, 0.0);
            OP.fontRender('$' + diff.toFixed(2), 600, 300);
        } else {
            OP.fontRender.Color(1.0, 0.0, 0.0);
            OP.fontRender('-$' + Math.abs(diff).toFixed(2), 600, 300);
        }


        var result = global.wallet.Total();

        if(result < 0) {
            OP.fontRender.Color(1.0, 0.0, 0.0);
        } else {
            OP.fontRender.Color(0.0, 0.8, 0.0);
        }
        this.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Cash', 550, 600);
        this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + result.toFixed(2), 600, 600);

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
