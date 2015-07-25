function Wallet() {
	// this.AddIncome('Tips', 'tip', 4.00);
	// this.AddExpense('Coffee', 'coffee', 2.00);
	this.cash = 100;
	this.loans = 80000;
	this.target = this.cash;
	this.TotalMoney = this.target;
}

Wallet.prototype = {
	cash: 0,
	loans: 0,
	lines: [],
	expenses: [],
	target: 0,
	TotalMoney: 0,

	AddIncome: function(name, type, amount) {
		this.lines.push({
			name: name,
			type: type,
			amount: amount
		});
		this.target += amount;
	},

	AddExpense: function(name, type, amount) {
		this.expenses.push({
			name: name,
			type: type,
			amount: amount
		});
		this.target -= amount;
	},

	AddExpenseInfo: function(name, type, amount) {
		this.expenses.push({
			name: name,
			type: type,
			amount: amount,
			info: true
		});
		this.target -= amount;
	},

	CompleteDay: function() {
		for(var i = 0; i < this.lines.length; i++) {
			this.cash += this.lines[i].amount;
		}
		for(var i = 0; i < this.expenses.length; i++) {
			this.cash -= this.expenses[i].amount;
		}
		this.target = this.cash;
		this.TotalMoney = this.target;
		this.lines = [];
		this.expenses = [];
	},

	_total: function() {
		var tempAmount = this.cash;
		for(var i = 0; i < this.lines.length; i++) {
			tempAmount += this.lines[i].amount;
		}
		return tempAmount;
	},

	Income: function() {
		var tempAmount = 0;
		for(var i = 0; i < this.lines.length; i++) {
			tempAmount += this.lines[i].amount;
		}
		return tempAmount;
	},

	Expenses: function() {
		var tempAmount = 0;
		for(var i = 0; i < this.expenses.length; i++) {
			tempAmount += this.expenses[i].amount;
		}
		return tempAmount;
	},

	Total: function() {
		return this.cash + this.Income() - this.Expenses();
	},

	Update: function(timer) {
		if(this.target != this.TotalMoney) {
			var diff = this.target - this.TotalMoney;
			diff *= timer.elapsed / 500.0;
			if(Math.abs(diff) < 0.001) {
				this.TotalMoney = this.target;
			} else {
				this.TotalMoney += diff;
			}
		}
	}
};

module.exports = Wallet;
