var OP = require('OPengine').OP;

function AudioPlayer() {

}

AudioPlayer.prototype = {
	currentBackground: -1,
	background: [],
	backgroundChannels: [],
	effects: [],
	effectsChannels: [],
	loaded: {},
	time: 0,

	Update: function(timer) {

		if(this.currentBackground > -1) {
			OP.fmod.Update(this.background[this.currentBackground]);
			if(!OP.fmod.IsPlaying(this.backgroundChannels[this.currentBackground])) {
				this.currentBackground++;
				this.currentBackground = this.currentBackground % this.background.length;

				this.backgroundChannels[this.currentBackground] = OP.fmod.Play(this.background[this.currentBackground]);
				OP.fmod.SetVolume(this.backgroundChannels[this.currentBackground], 0.2);
			}
		}

		for(var i = 0; i < this.effects.length;i++) {
			OP.fmod.Update(this.effects[i]);
			if(!OP.fmod.IsPlaying(this.effectsChannels[i])) {
				this.effects.splice(i,1);
				this.effectsChannels.splice(i,1);
			}
		}

	},

	AddBackground: function(file) {
		var background = OP.fmod.Load(file);
		this.background.push(background);
		if(this.currentBackground == -1) {
			this.currentBackground = 0;
			this.backgroundChannels[this.currentBackground] = OP.fmod.Play(this.background[this.currentBackground]);
			OP.fmod.SetVolume(this.backgroundChannels[this.currentBackground], 0.15);
		}
	},

	PlayEffect: function(file) {
		if(!this.loaded[file]) {
			this.loaded[file] = OP.fmod.Load(file);
		}
		this.effectsChannels[this.effects.length] = OP.fmod.Play(this.loaded[file]);
		this.effects.push(this.loaded[file]);
	}

};

module.exports = AudioPlayer;
