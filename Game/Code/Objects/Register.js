function Register() {

}

Register.prototype = {
	interacting: [],

	Interact: function() {
		if(global.job && global.job.title == 'barista' && this.customer) {
			return this.customer.Interact();
		} else if(this.employee) {
			return this.employee.Interact();
		}
		return null;
	},

	CharacterInteract: function(character, collision) {

		if(collision.data && collision.data.customer) {
			this.customer = character;
			console.log('CUSTOMER SET');
		} else {
			this.employee = character;
		}
		// console.log('INTERACTED', character);
		// this.interacting.push(character);
	},

	Leave: function(character) {
		if(this.customer == character) {
			this.customer = null;
		}
		if(this.employee == character) {
			this.employee = null;
		}
	},

	CanInteract: function() {
		if(global.job && global.job.title == 'barista') {
			if(this.customer) {
				return null;
			}
			return {
				text: 'No customer'
			}
		} else if(this.employee == true) {
			return {
				text: 'No employee'
			}
		}

		return null;
	}
};

module.exports = Register;
