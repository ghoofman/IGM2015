function Wallet() {
	// this.AddIncome('Tips', 'tip', 4.00);
	// this.AddExpense('Coffee', 'coffee', 2.00);
	this.cash = 100;
	this.loans = 40000;
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
	Last: null,

	clone: function() {
		var result = new Wallet();
		result.cash = this.cash;
		result.loans = this.loans;
		result.lines = [];
		for(var i = 0; i < this.lines.length; i++) {
			result.lines.push(this.lines[i]);
		}
		result.expenses = [];
		for(var i = 0; i < this.expenses.length; i++) {
			result.expenses.push(this.expenses[i]);
		}
		result.target = this.target;
		result.TotalMoney = this.TotalMoney;
		return result;
	},

	AddIncome: function(name, type, amount, rate, rateScale, info) {
		var income = {
			name: name,
			type: type,
			amount: amount,
			desc: info
		};
		if(rate) {
			income.rate = rate;
			income.rateScale = rateScale || 'hr';
		}
		this.lines.push(income);
		this.target += amount;
		this.Last = {
			type: 'income',
			time: 0,
			amount: amount
		};
	},

	AddIncomeInfo: function(name, type, amount) {
		this.lines.push({
			name: name,
			type: type,
			amount: amount,
			info: true
		});
		this.target -= amount;
	},

	AddExpense: function(name, type, amount, rate, rateScale, info) {
		var expense = {
			name: name,
			type: type,
			amount: amount,
			desc: info
		};
		if(rate) {
			expense.rate = rate;
			expense.rateScale = rateScale || 'hr';
		}
		this.expenses.push(expense);
		this.target -= amount;
		this.Last = {
			type: 'expense',
			time: 0,
			amount: amount
		};
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

		if(this.Last) {
			this.Last.time += timer.elapsed;
			if(this.Last.time > 2000) {
				this.Last = null;
			}
		}
	},

	AddWalletLines: function() {

		var interest = this.loans * (0.08 / 365.0);

	    this.AddExpense('Student Loan Payment', 'loan', 15, 10, 'day', '$' + interest.toFixed(2) + ' of Interest');
	    this.loans -= 15 - interest;

	    this.AddExpense('Cell Phone Plan', 'cell', 2, 60, 'mo');

	    if(global.apartment) {
	        this.AddExpense('Apartment Rent', 'rent', global.apartment.rent, global.apartment.rent * 30, 'mo');
	    }
	    if(global.job) {
	        var rate = global.job.rate || 8;
	        var totalTime = global.job.time || 0;
	        var seconds = totalTime / 1000;
	        var minutes = seconds / 60;
	        var hours = minutes / 60.0;
	        this.AddIncome('Cafe Pay Check', 'pay', hours * rate, rate, 'hr', hours.toFixed(2) + ' hours @ $' + rate.toFixed(2) + ' / hr');
	        this.AddExpense('Taxes', 'tax', (hours * rate) * 0.33, null, null, '33% of Pay Check');
	    }
		if(global.girlfriend) {
			this.AddExpense('Girlfriend Expense', 'pay', 10);
		}
	}
};

module.exports = Wallet;
