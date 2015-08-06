module.exports = function(cupType, coffeeType) {
	return function() {
		if(this.complete && this.complete()) return null;

		var cup = global.inventory.Get('cup');

		if(cup && cup.type == cupType) {

			if(cup.coffee && cup.coffee.type == coffeeType) {
				// Send them to the register
				return {
					pos: [ 70, 90, 0 ],
					rotateZ: -3.14 / 2.0,
					startScale: 1.0
				};
			} else if(cup.coffee) {
				// Have coffee, but it's the wrong kind
				// send them to the trash can
				return {
					pos: [114, 90, 0 ],
					rotateZ: -3.14 / 2.0,
					startScale: 1.0
				};

			}
			// we have a cup look at the coffee
			return {
				pos: [-20, 90, -76 ],
				rotateZ: -3.14 / 2.0,
				startScale: 1.0
			};
		}

		// Look at the cups
		return {
			pos: [ -90, 90, -30 ],
			rotateZ: -3.14 / 2.0,
			startScale: 1.0
		};
	}
};
