var OP = require('OPengine').OP;
var Input = require('../../Utils/Input.js');
var DateAndTime = require('date-and-time');

function Progress(base) {
	this.base = base;

	this.wallet = global.wallet.clone();

	var interest = this.wallet.loans * (0.04 / 365.0);

    this.wallet.AddExpense('Student Loan Payment', 'loan', 10, 10, 'day');
    this.wallet.AddExpenseInfo('Principal', 'loan', 10 - interest);
    this.wallet.AddExpenseInfo('Interest', 'loan', interest);
    this.wallet.loans -= 10 - interest;

    this.wallet.AddExpense('Cell Phone Plan', 'cell', 2, 60, 'mo');

    if(global.apartment) {
        this.wallet.AddExpense('Apartment Rent', 'rent', global.apartment.rent, global.apartment.rent * 30, 'mo');
    }
    if(global.job) {
        var rate = global.job.rate || 8;
        var totalTime = global.job.time || 0;
        var seconds = totalTime / 1000;
        var minutes = seconds / 60;
        var hours = minutes / 60.0;
        this.wallet.AddIncome('Cafe Pay Check', 'pay', hours * rate, rate, 'hr');
        this.wallet.AddIncomeInfo(hours.toFixed(2) + ' hours worked', 'pay', 0);
        this.wallet.AddExpense('Federal Taxes', 'tax', (hours * rate) * 0.20);
        this.wallet.AddExpenseInfo('20% of Pay Check', 'tax', 0);
        this.wallet.AddExpense('State Taxes', 'tax', (hours * rate) * 0.13);
        this.wallet.AddExpenseInfo('13% of Pay Check', 'tax', 0);
    }
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
	},

    _DrawIncome: function() {

        OP.fontRender.Begin(this.base.fontManager72);
        this.base.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(0.0, 0.8, 0.0);
        OP.fontRender('>  Income Today  <', this.base.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();


        OP.fontRender.Begin(this.base.fontManager);

        this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender.Color(0.0, 0.8, 0);

        var posY = 150;
        var total = 0;
		var offsetX = 100;

		// Draw the non-info lines
        for(var i = 0; i < this.wallet.lines.length; i++) {
            total += this.wallet.lines[i].amount;
            this.base.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
            var offset = 0;
            if(this.wallet.lines[i].info) {
                posY += 35;
                continue;
                OP.fontRender.Color(1.0, 1.0, 1.0);
            } else {
                OP.fontRender.Color(0.0, 0.8, 0);
            }

            OP.fontRender(this.wallet.lines[i].name, offsetX + 550 + offset, posY);

            this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);
            OP.fontRender('$' + this.wallet.lines[i].amount.toFixed(2), offsetX + 600 + offset, posY);

            if(this.wallet.lines[i].rate) {
                OP.fontRender('$' + this.wallet.lines[i].rate.toFixed(2) + ' / ' + this.wallet.expenses[i].rateScale, offsetX + 800 + offset, posY);
            }

            posY += 50;
        }

        this.base.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Total', 550, 600);
        this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + total.toFixed(2), 600, 600);

        OP.fontRender.End();


        OP.fontRender.Begin(this.base.fontManager24);
        var posY = 160;

		// Draw the info lines
        for(var i = 0; i < this.wallet.lines.length; i++) {

            this.base.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            var offset = 50;
            if(!this.wallet.lines[i].info) {
                posY += 50;
                continue;
            } else {
                OP.fontRender.Color(1.0, 1.0, 1.0);
            }

            if(this.wallet.lines[i].amount) {
                OP.fontRender('$' + this.wallet.lines[i].amount.toFixed(2) + ' ' + this.wallet.expenses[i].name, offsetX + 600, posY);
            } else {
                OP.fontRender(this.wallet.lines[i].name, offsetX + 600, posY);
            }

            posY += 35;
        }

        OP.fontRender.End();

    },

    _DrawExpenses: function() {

        OP.fontRender.Begin(this.base.fontManager72);
        this.base.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(1.0, 0.0, 0.0);
        OP.fontRender('>  Expenses Today  <', this.base.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();


        OP.fontRender.Begin(this.base.fontManager);

        this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender.Color(1.0, 0, 0);

        var posY = 150;
        var total = 0;
		var offsetX = 100;
        for(var i = 0; i < this.wallet.expenses.length; i++) {
            total += this.wallet.expenses[i].amount;
            this.base.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
            var offset = 0;
            if(this.wallet.expenses[i].info) {
                posY += 35;
                continue;
                OP.fontRender.Color(1.0, 1.0, 1.0);
            } else {
                OP.fontRender.Color(1.0, 0, 0);
            }

            OP.fontRender(this.wallet.expenses[i].name, offsetX + 550 + offset, posY);

            this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);
            OP.fontRender('$' + this.wallet.expenses[i].amount.toFixed(2), offsetX + 600 + offset, posY);

            if(this.wallet.expenses[i].rate) {
                OP.fontRender('$' + this.wallet.expenses[i].rate.toFixed(2) + ' / ' + this.wallet.expenses[i].rateScale, offsetX + 800 + offset, posY);
            }

            posY += 50;
        }

        this.base.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Total', 550, 600);
        this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + total.toFixed(2), 600, 600);

        OP.fontRender.End();


        OP.fontRender.Begin(this.base.fontManager24);
        var posY = 160;
        for(var i = 0; i < this.wallet.expenses.length; i++) {

            this.base.fontManager24.SetAlign(OP.FONTALIGN.LEFT);
            var offset = 50;
            if(!this.wallet.expenses[i].info) {
                posY += 50;
                continue;
            } else {
                OP.fontRender.Color(1.0, 1.0, 1.0);
            }

            if(this.wallet.expenses[i].amount) {
                OP.fontRender('$' + this.wallet.expenses[i].amount.toFixed(2) + ' ' + this.wallet.expenses[i].name, offsetX + 600, posY);
            } else {
                OP.fontRender(this.wallet.expenses[i].name, offsetX + 600, posY);
            }

            posY += 35;
        }

        OP.fontRender.End();

    },

    _DrawNet: function() {

        OP.fontRender.Begin(this.base.fontManager72);
        this.base.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
        OP.fontRender.Color(1.0, 1.0, 1.0);
        OP.fontRender('>  Result Today  <', this.base.size.ScaledWidth / 2.0, 50);
        OP.fontRender.End();

		var offsetX = 100;

        OP.fontRender.Begin(this.base.fontManager);

        this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);

        this.base.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
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

        OP.fontRender("Student Loans", offsetX + 550, 400);

        this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);
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
        this.base.fontManager.SetAlign(OP.FONTALIGN.RIGHT);
        OP.fontRender('Cash', 550, 600);
        this.base.fontManager.SetAlign(OP.FONTALIGN.LEFT);
        OP.fontRender('$' + result.toFixed(2), 600, 600);

        OP.fontRender.End();
    },
};

module.exports = Progress;
