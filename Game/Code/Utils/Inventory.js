var OP = require('OPengine').OP;

function Inventory() {
	this.size = OP.render.Size();
	this.screenCamera = OP.cam.Ortho(0, 0, 10, 0, 0, 0, 0, 1, 0, 0.1, 20.0, 0, this.size.ScaledWidth, 0, this.size.ScaledHeight);
}

Inventory.prototype = {
	systems: [],
	sheets: {},

	Update: function(timer) {

	},

	Draw: function() {
		for(var i = 0; i < this.systems.length; i++) {
			OP.spriteSystem.Render(this.sheets[this.systems[i]].spriteSystem, this.screenCamera);
		}
	},

	Rebuild: function(sheet) {
		this.sheets[sheet].spriteSystem = OP.spriteSystem.Create(this.sheets[sheet].sprites, this.sheets[sheet].sprites.length, OP.SPRITESYSTEMALIGN.BOTTOM_CENTER);

		for(var i = 0; i < this.sheets[sheet].sprites.length; i++) {
			var sprite = OP.spriteSystem.Add(this.sheets[sheet].spriteSystem);
			sprite.Position.Set(230 + i * 50, 15);
			sprite.Scale.Set(0.25, 0.25, 0.25);
			OP.spriteSystem.SetSprite(sprite, i);
		}
	},

	Add: function(sheet, item) {
		if(this.sheets[sheet]) {
			OP.spriteSystem.Destroy(this.sheets[sheet].spriteSystem);
		} else {
			this.systems.push(sheet);
			this.sheets[sheet] = {
				sprites: [],
				items: []
			};
		}

		// Ensure it's loaded
		OP.cman.Load(sheet + '.opss');
		this.sheets[sheet].sprites.push(OP.cman.Get(sheet + '/' + item));
		this.sheets[sheet].items.push(item);
		this.Rebuild(sheet);
	},

	Remove: function(sheet, item) {
		if(this.sheets[sheet]) {
			for(var i = 0; i < this.sheets[sheet].items.length; i++) {
				if(this.sheets[sheet].items[i] == item) {
					this.sheets[sheet].sprites.splice(i, 1);
					this.sheets[sheet].items.splice(i, 1);
				}
			}
			this.Rebuild(sheet);
		}
	}

};

module.exports = Inventory;
