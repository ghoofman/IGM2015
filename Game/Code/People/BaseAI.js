var OP = require('OPengine').OP;

function BaseAI(ai) {
	this.ai = ai;
	this.speed = 1;
}

BaseAI.prototype = {

	Move: function(timer) {

		if(this.ai.target && this.ai.character.alive && !this.ai.character.dead) {
			var diffX = this.ai.target[0] - this.ai.character.FootPos.x;
			var diffZ = this.ai.target[2] - this.ai.character.FootPos.z;

			if(Math.abs(diffX) < 0.1 && Math.abs(diffZ) < 0.1) {
				this.ai.target = null;
			} else {

				this.ai.move = [ diffX, -0.98 * 4, diffZ ];
				this.ai.vec3.Set(this.ai.move[0], this.ai.move[1], this.ai.move[2]);
				this.ai.vec3.Norm();
				var speed = this.speed || 1;
				this.ai.vec3.Set(this.ai.vec3.x * speed, this.ai.vec3.y, this.ai.vec3.z * speed)

				OP.physXController.Move(this.ai.character.controller, this.ai.vec3, timer);
				var oldPos = this.ai.character.FootPos;
				this.ai.character.FootPos = OP.physXController.GetFootPos(this.ai.character.controller);

				if(this.ai.move[0] != 0 || this.ai.move[1] != 0) {
				  this.ai.character.rotate = Math.atan2(this.ai.move[0], this.ai.move[2]);
				}

				var moveX = (oldPos.x - this.ai.character.FootPos.x);
				var moveZ = (oldPos.z - this.ai.character.FootPos.z);
				// If we tried to move more than 0.1 but didn't on both axes, then it's time to wander
				if(Math.abs(moveX) < 0.1 && Math.abs(diffX) > 0.1 && Math.abs(moveZ) < 0.1 && Math.abs(diffZ) > 0.1 ) {
					if(this.ai.state == 'WANDER') {
						this.ai.state = null;
						this.ai.target = null;
					} else {
						this.ai.state = 'WANDER';

						var x = 0;
						var z = 0;

						if(this.ai.target[0] > oldPos.x) {
							x = oldPos.x + 50 + Math.random() * 50;
						} else {
							x = oldPos.x - 50 - Math.random() * 50;
						}
						if(this.ai.target[2] > oldPos.z) {
							z = oldPos.z + 50 + Math.random() * 50;
						} else {
							z = oldPos.z - 50 - Math.random() * 50;
						}

						this.ai.target = [
							x,
							0,
							z
						];
					}
				}
			}
		}

	}

};

module.exports = BaseAI;
