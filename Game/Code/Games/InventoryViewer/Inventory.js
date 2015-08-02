var OP = require('OPengine').OP;
var Input = require('../../Utils/Input.js');

function Inventory(base) {

	this.base = base;

	this.spriteSystems = {};
	this.items = [];
	this.selected = -1;

	for(var key in global.inventory.items) {
		if(global.inventory.items[key]) {
			var item = global.inventory.items[key];
			item.key = key;
			this.items.push(item);
		}
	}

	for(var i = 0; i < this.items.length; i++) {
		var sheet = this.items[i].sheet;
		OP.cman.Load(sheet);
		if(!this.spriteSystems[sheet]) {
			this.spriteSystems[sheet] = {
				sprites: [],
				spriteSystem: null
			};
		}
		this.spriteSystems[sheet].sprites.push(OP.cman.Get(sheet + '/' + this.items[i].item));
	}

	for(var key in this.spriteSystems) {
		this.spriteSystems[key].spriteSystem = OP.spriteSystem.Create(
			this.spriteSystems[key].sprites,
			1,
			OP.SPRITESYSTEMALIGN.CENTER);
	}

	if(this.items.length > 0) {
		this.selected = 0;
		var sheet = this.items[this.selected].sheet;
		this.items[this.selected]._sprite = OP.spriteSystem.Add(
			this.spriteSystems[sheet].spriteSystem);

		this.items[this.selected]._sprite.Scale.Set(0.5, 0.5, 0.5);
		OP.spriteSystem.SetSprite(this.items[this.selected]._sprite, this.selected);
		this.items[this.selected]._sprite.Position.Set(this.base.size.ScaledWidth / 2.0, this.base.size.ScaledHeight / 2.0);

	}
}

Inventory.prototype = {
	text: 'Inventory',
	selected: -1,
	spriteSystems: {},

	render: function() {
		for(var key in this.spriteSystems) {
			OP.spriteSystem.Render(
				this.spriteSystems[key].spriteSystem, this.base.screenCamera);
		}

		OP.fontRender.Begin(this.base.fontManager36);
		OP.fontRender.Color(0.0, 0.7, 0.0);
		if(this.items.length > 1) {
			OP.fontRender(">", -200 + this.base.size.ScaledWidth / 2.0, this.base.size.ScaledHeight / 2.0);
			OP.fontRender("<", 200 + this.base.size.ScaledWidth / 2.0, this.base.size.ScaledHeight / 2.0);
		}
		OP.fontRender.End();

		if(this.selected > -1) {
			OP.fontRender.Begin(this.base.fontManager36);
			this.base.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
			OP.fontRender(this.items[this.selected].text, this.base.size.ScaledWidth / 2.0, 100 + this.base.size.ScaledHeight / 2.0);
			OP.fontRender.End();

			OP.fontRender.Begin(this.base.fontManager24);
			this.base.fontManager24.SetAlign(OP.FONTALIGN.CENTER);
			for(var i = 0 ; i < this.items[this.selected].desc.length; i++) {
				OP.fontRender(this.items[this.selected].desc[i], this.base.size.ScaledWidth / 2.0, i * 30 + 175 + this.base.size.ScaledHeight / 2.0);
			}
			if(this.items[this.selected].active) {
				OP.fontRender('[ Currently Selected ]', this.base.size.ScaledWidth / 2.0, i * 30 + 225 + this.base.size.ScaledHeight / 2.0);
			}
			OP.fontRender.End();
		}
	},

	update: function(timer, gamepad) {
		if(Input.IsBackDown(gamepad)) {
			OP.spriteSystem.SetSprite(this.base.back, 4);
		} else {
			OP.spriteSystem.SetSprite(this.base.back, 5);
		}

		if(this.initialRelease && Input.WasBackReleased(gamepad)) {
			return { result: 1 };
		}

		if(Input.IsActionDown(gamepad)) {
			OP.spriteSystem.SetSprite(this.base.btn, 0);

		} else {
			OP.spriteSystem.SetSprite(this.base.btn, 1);
		}

		if(Input.WasActionReleased(gamepad)) {
			if(global.inventory.Activate(this.items[this.selected].key)) {

				var sheet = this.items[this.selected].sheet;
				var spriteSystem = this.spriteSystems[sheet].spriteSystem;
				OP.spriteSystem.Remove(spriteSystem, this.items[this.selected]._sprite);

				this.items.splice(this.selected, 1);


				if(this.items.length > 0) {
					this.selected--;
					if(this.selected < 0) this.selected = this.items.length - 1;
					this.selected = this.selected % this.items.length;
					
					var sheet = this.items[this.selected].sheet;
					this.items[this.selected]._sprite = OP.spriteSystem.Add(
						this.spriteSystems[sheet].spriteSystem);

					this.items[this.selected]._sprite.Scale.Set(0.5, 0.5, 0.5);
					OP.spriteSystem.SetSprite(this.items[this.selected]._sprite, this.selected);
					this.items[this.selected]._sprite.Position.Set(this.base.size.ScaledWidth / 2.0, this.base.size.ScaledHeight / 2.0);
				}

			}
		}

		if(this.selected > -1) {

			if(Input.WasLeftPressed(gamepad)) {

				if(this.items[this.selected]._sprite) {
					var sheet = this.items[this.selected].sheet;
					var spriteSystem = this.spriteSystems[sheet].spriteSystem;
					OP.spriteSystem.Remove(spriteSystem, this.items[this.selected]._sprite);

					this.items[this.selected]._sprite = null;

					this.selected--;
					if(this.selected < 0) this.selected = this.items.length - 1;
					this.selected = this.selected % this.items.length;

					var sheet = this.items[this.selected].sheet;
					this.items[this.selected]._sprite = OP.spriteSystem.Add(
						this.spriteSystems[sheet].spriteSystem);

					this.items[this.selected]._sprite.Scale.Set(0.5, 0.5, 0.5);
					OP.spriteSystem.SetSprite(this.items[this.selected]._sprite, this.selected);
					this.items[this.selected]._sprite.Position.Set(this.base.size.ScaledWidth / 2.0, this.base.size.ScaledHeight / 2.0);
				}
			}

			if(Input.WasRightPressed(gamepad)) {

				if(this.items[this.selected]._sprite) {
					OP.spriteSystem.Remove(this.spriteSystems[this.items[this.selected].sheet].spriteSystem, this.items[this.selected]._sprite);

					this.selected++;
					this.selected = this.selected % this.items.length;

					var sheet = this.items[this.selected].sheet;
					this.items[this.selected]._sprite = OP.spriteSystem.Add(
						this.spriteSystems[sheet].spriteSystem);

					this.items[this.selected]._sprite.Scale.Set(0.5, 0.5, 0.5);
					OP.spriteSystem.SetSprite(this.items[this.selected]._sprite, this.selected);
					this.items[this.selected]._sprite.Position.Set(this.base.size.ScaledWidth / 2.0, this.base.size.ScaledHeight / 2.0);

				}
			}
		}

		return {
			result: 0
		};
	}
};

module.exports = Inventory;
