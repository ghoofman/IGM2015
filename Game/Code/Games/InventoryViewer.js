var OP = require('OPengine').OP;
var Input = require('../Utils/Input.js');

function InventoryViewer() {

	this.spriteSystems = {};
	this.items = [];
	this.selected = -1;

	this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
	this.background.Scale.Set(2, 2);

	this.fontManager36 = OP.fontManager.Setup('pixel.opf');
	this.fontManager24 = OP.fontManager.Setup('pixel24.opf');

	for(var key in global.inventory.items) {
		console.log(key);
		console.log(global.inventory.items[key]);
		if(global.inventory.items[key]) {
			this.items.push(global.inventory.items[key]);
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
		console.log('ADDING ITEM', sheet, this.items[i].item);
		this.spriteSystems[sheet].sprites.push(OP.cman.Get(sheet + '/' + this.items[i].item));
	}

	for(var key in this.spriteSystems) {
		console.log('GEN SYSTEM', key, this.spriteSystems[key].sprites, this.spriteSystems[key].sprites.length);
		this.spriteSystems[key].spriteSystem = OP.spriteSystem.Create(
			this.spriteSystems[key].sprites,
			1,
			OP.SPRITESYSTEMALIGN.CENTER);
	}

	this.size = OP.render.Size();
	this.screenCamera = OP.cam.Ortho(0, 0, 10, 0, 0, 0, 0, 1, 0, 0.1, 20.0, 0, this.size.ScaledWidth, 0, this.size.ScaledHeight);


	if(this.items.length > 0) {
		this.selected = 0;
		var sheet = this.items[this.selected].sheet;
		console.log('BUILDING ITEM', sheet);
		this.items[this.selected]._sprite = OP.spriteSystem.Add(
			this.spriteSystems[sheet].spriteSystem);

		this.items[this.selected]._sprite.Scale.Set(0.5, 0.5, 0.5);
		OP.spriteSystem.SetSprite(this.items[this.selected]._sprite, this.selected);
		this.items[this.selected]._sprite.Position.Set(this.size.ScaledWidth / 2.0, this.size.ScaledHeight / 2.0);

	}


	var sheet = 'BaseSelector';
	OP.cman.Load(sheet + '.opss');
	this.uiSpriteSystem = {
		sprites: [],
		spriteSystem: null
	};

	this.uiSpriteSystem.sprites.push(OP.cman.Get(sheet + '/Action'));
	this.uiSpriteSystem.sprites.push(OP.cman.Get(sheet + '/ActionOff'));
	this.uiSpriteSystem.sprites.push(OP.cman.Get(sheet + '/ActionPush'));
	this.uiSpriteSystem.sprites.push(OP.cman.Get(sheet + '/ProgressBackground'));
	this.uiSpriteSystem.spriteSystem = OP.spriteSystem.Create(
		this.uiSpriteSystem.sprites,
		2,
		OP.SPRITESYSTEMALIGN.CENTER);

	var titleBg = OP.spriteSystem.Add(this.uiSpriteSystem.spriteSystem);
	titleBg.Position.Set(this.size.ScaledWidth / 2.0, this.size.ScaledHeight / 2.0);
	titleBg.Scale.Set(1000, 1);
	OP.spriteSystem.SetSprite(titleBg, 3);


	this.btn = OP.spriteSystem.Add(this.uiSpriteSystem.spriteSystem);
	this.btn.Position.Set(this.size.ScaledWidth - 100, 50);
}

InventoryViewer.prototype = {
	spriteSystems: {},
	items: [],
	selected: -1,

	Update: function(timer, gamepad) {

		if(Input.WasActionPressed(gamepad)) {
			return {
				result: 1
			}
		}
		if(Input.WasBackPressed(gamepad)) {
			return {
				result: 1
			}
		}


		if(this.selected > -1) {

	        if(Input.WasLeftPressed(gamepad)) {

				if(this.items[this.selected]._sprite) {
					var sheet = this.items[this.selected].sheet;
					var spriteSystem = this.spriteSystems[sheet].spriteSystem;
					OP.spriteSystem.Remove(spriteSystem, this.items[this.selected]._sprite);

					console.log('LEFT', this.selected, this.items[this.selected]);
					this.items[this.selected]._sprite = null;

					this.selected--;
		            if(this.selected < 0) this.selected = this.items.length - 1;
		            this.selected = this.selected % this.items.length;

					console.log('LEFT', this.selected, this.items[this.selected]);

					var sheet = this.items[this.selected].sheet;
					this.items[this.selected]._sprite = OP.spriteSystem.Add(
						this.spriteSystems[sheet].spriteSystem);

					this.items[this.selected]._sprite.Scale.Set(0.5, 0.5, 0.5);
					OP.spriteSystem.SetSprite(this.items[this.selected]._sprite, this.selected);
					this.items[this.selected]._sprite.Position.Set(this.size.ScaledWidth / 2.0, this.size.ScaledHeight / 2.0);
		        }
			}

	        if(Input.WasRightPressed(gamepad)) {

				if(this.items[this.selected]._sprite) {
					OP.spriteSystem.Remove(this.spriteSystems[this.items[this.selected].sheet].spriteSystem, this.items[this.selected]._sprite);

					console.log('RIGHT', this.selected, this.items[this.selected]);

					this.selected++;
		            this.selected = this.selected % this.items.length;


					console.log('RIGHT', this.selected, this.items[this.selected]);

					var sheet = this.items[this.selected].sheet;
					this.items[this.selected]._sprite = OP.spriteSystem.Add(
						this.spriteSystems[sheet].spriteSystem);

					this.items[this.selected]._sprite.Scale.Set(0.5, 0.5, 0.5);
					OP.spriteSystem.SetSprite(this.items[this.selected]._sprite, this.selected);
					this.items[this.selected]._sprite.Position.Set(this.size.ScaledWidth / 2.0, this.size.ScaledHeight / 2.0);

		        }
			}
		}

		return {
			result: 0
		};
	},

	Draw: function() {
        OP.texture2D.Render(this.background);

		OP.spriteSystem.Render(
			this.uiSpriteSystem.spriteSystem, this.screenCamera);

		for(var key in this.spriteSystems) {
			//console.log(this.spriteSystems[key].spriteSystem, this.screenCamera);
			OP.spriteSystem.Render(
				this.spriteSystems[key].spriteSystem, this.screenCamera);
		}

		OP.fontRender.Begin(this.fontManager36);
		this.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
		OP.fontRender("My Inventory", this.size.ScaledWidth / 2.0, -250 + this.size.ScaledHeight / 2.0);
		OP.fontRender.Color(0.0, 0.7, 0.0);
		if(this.items.length > 1) {
			OP.fontRender(">", -200 + this.size.ScaledWidth / 2.0, this.size.ScaledHeight / 2.0);
			OP.fontRender("<", 200 + this.size.ScaledWidth / 2.0, this.size.ScaledHeight / 2.0);
		}
		OP.fontRender.End();

		if(this.selected > -1) {
			OP.fontRender.Begin(this.fontManager36);
			this.fontManager36.SetAlign(OP.FONTALIGN.CENTER);
			OP.fontRender(this.items[this.selected].text, this.size.ScaledWidth / 2.0, 100 + this.size.ScaledHeight / 2.0);
			OP.fontRender.End();

			OP.fontRender.Begin(this.fontManager24);
			this.fontManager24.SetAlign(OP.FONTALIGN.CENTER);
			for(var i = 0 ; i < this.items[this.selected].desc.length; i++) {
				OP.fontRender(this.items[this.selected].desc[i], this.size.ScaledWidth / 2.0, i * 30 + 175 + this.size.ScaledHeight / 2.0);
			}
			OP.fontRender.End();
		}
	},

	Exit: function() {

	}
};

module.exports = function() {
	return new InventoryViewer();
}
