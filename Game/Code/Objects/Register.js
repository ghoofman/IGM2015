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
		} else {
			this.employee = character;
		}
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
		if(global.job && global.job.title == 'barista' && global.job.clocked) {
			if(this.customer) {
				return null;
			}
			return {
				text: 'No customer'
			}
		} else if(!this.employee) {
			return {
				text: 'No employee'
			}
		}

		return null;
	}
};

module.exports = Register;
