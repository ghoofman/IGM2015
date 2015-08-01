var OP = require('OPengine').OP;
var Input = require('../../Utils/Input.js');
var DateAndTime = require('date-and-time');

function Job(base) {
	this.base = base;
}

Job.prototype = {
	text: 'Job',

	render: function() {
		OP.fontRender.Begin(this.base.fontManager36);
		this.base.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
		OP.fontRender.Color(1.0, 1.0, 1.0);
		if(global.job) {
			OP.fontRender('Employed at Cup a Joe as a ' + global.job.title, this.base.size.ScaledWidth / 2.0, 100);
			OP.fontRender('Making $' + global.job.rate + ' / hr', this.base.size.ScaledWidth / 2.0, 150);
			OP.fontRender('Schedule:', this.base.size.ScaledWidth / 2.0, 250);
			for(var i = 0; i < global.job.schedule.length; i++) {
				var start = '';
				if(global.job.schedule[i].start < 12) {
					start = global.job.schedule[i].start + ':00 am';
				} else {
					if(global.job.schedule[i].start == 12) {
						start = '12:00 pm';
					} else {
						start = (global.job.schedule[i].start - 12) + ':00 pm';
					}
				}
				var end = '';
				if(global.job.schedule[i].end < 12) {
					end = global.job.schedule[i].end + ':00 am';
				} else {
					if(global.job.schedule[i].end == 12) {
						end = '12:00 pm';
					} else {
						end = (global.job.schedule[i].end - 12) + ':00 pm';
					}
				}
				OP.fontRender(start + ' - ' + end, this.base.size.ScaledWidth / 2.0, 300 + i * 50);
			}
		}
		OP.fontRender.End();
	},

	update: function(timer, gamepad) {
		if(Input.IsActionDown(gamepad)) {
			OP.spriteSystem.SetSprite(this.base.back, 4);
		} else {
			OP.spriteSystem.SetSprite(this.base.back, 5);
		}

		if(this.base.initialRelease && Input.WasBackReleased(gamepad)) {
			return { result: 1 };
		}

		if(Input.WasActionPressed(gamepad) || Input.WasBackPressed(gamepad)) {
			return { result: 1 };
		}
		return { result: 0 };
	}
};

module.exports = Job;
