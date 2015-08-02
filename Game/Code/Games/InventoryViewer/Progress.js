var OP = require('OPengine').OP;
var Input = require('../../Utils/Input.js');
var DateAndTime = require('date-and-time');
var EndOfDay = require('../EndOfDay.js');

function Progress(base) {
	this.base = base;

	this.wallet = global.wallet.clone();
	this.wallet.AddWalletLines();

	this.fontManager = this.base.fontManager;
	this.fontManager24 = this.base.fontManager24;
	this.fontManager72 = this.base.fontManager72;

	this.size = OP.render.Size();

	var eod = new EndOfDay();
	this._DrawIncome = eod._DrawIncome;
	this._DrawExpenses = eod._DrawExpenses;
	this._DrawNet = eod._DrawNet;

}

Progress.prototype = {
	text: 'Progress',
	state: 0,

	render: function() {
        switch(this.base.state) {
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
	},

	update: function(timer, gamepad) {
		if(Input.IsActionDown(gamepad)) {
			OP.spriteSystem.SetSprite(this.base.btn, 0);
		} else {
			OP.spriteSystem.SetSprite(this.base.btn, 1);
		}

		if(Input.IsBackDown(gamepad)) {
			OP.spriteSystem.SetSprite(this.base.back, 4);
		} else {
			OP.spriteSystem.SetSprite(this.base.back, 5);
		}

		if(this.base.initialRelease && Input.WasBackReleased(gamepad)) {
			return { result: 1 };
		}

        if(Input.WasLeftPressed(gamepad)) {
			this.base.state--;
			if(this.base.state < 0) this.base.state = 2;
			this.base.state = this.base.state % 3;
		}

        if(Input.WasRightPressed(gamepad) || Input.WasActionReleased(gamepad)) {
			this.base.state++;
			this.base.state = this.base.state % 3;
		}
		return { result: 0 };
	}
};

module.exports = Progress;
