var OP = require('OPengine').OP;
var Input = require('../Utils/Input.js');
var DateAndTime = require('date-and-time');
var Progress = require('./InventoryViewer/Progress.js');
var Inventory = require('./InventoryViewer/Inventory.js');
var Journal = require('./InventoryViewer/Journal.js');
var Settings = require('./InventoryViewer/Settings.js');
var Quit = require('./InventoryViewer/Quit.js');
var Notifications = require('./InventoryViewer/Notifications.js');
var Job = require('./InventoryViewer/Job.js');

function InventoryViewer() {

	this.initialRelease = 0;

	this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
	this.background.Scale.Set(2, 2);

	this.fontManager = OP.fontManager.Setup('pixel.opf');
	this.fontManager36 = OP.fontManager.Setup('pixel.opf');
	this.fontManager24 = OP.fontManager.Setup('pixel24.opf');
	this.fontManager72 = OP.fontManager.Setup('pixel72.opf');

	this.size = OP.render.Size();
	this.screenCamera = OP.cam.Ortho(0, 0, 10, 0, 0, 0, 0, 1, 0, 0.1, 20.0, 0, this.size.ScaledWidth, 0, this.size.ScaledHeight);

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
	this.uiSpriteSystem.sprites.push(OP.cman.Get(sheet + '/BackButton'));
	this.uiSpriteSystem.sprites.push(OP.cman.Get(sheet + '/BackButtonOff'));
	this.uiSpriteSystem.sprites.push(OP.cman.Get(sheet + '/BackButtonPush'));
	this.uiSpriteSystem.spriteSystem = OP.spriteSystem.Create(
		this.uiSpriteSystem.sprites,
		3,
		OP.SPRITESYSTEMALIGN.CENTER);

	var titleBg = OP.spriteSystem.Add(this.uiSpriteSystem.spriteSystem);
	titleBg.Position.Set(this.size.ScaledWidth / 2.0, this.size.ScaledHeight / 2.0);
	titleBg.Scale.Set(1000, 1);
	OP.spriteSystem.SetSprite(titleBg, 3);

	this.btn = OP.spriteSystem.Add(this.uiSpriteSystem.spriteSystem);
	this.btn.Position.Set(this.size.ScaledWidth - 100, 50);
	OP.spriteSystem.SetSprite(this.btn, 1);

	this.back = OP.spriteSystem.Add(this.uiSpriteSystem.spriteSystem);
	this.back.Position.Set(100, 50);
	OP.spriteSystem.SetSprite(this.back, 5);



	var self = this;

	this.subSelection = 0;
	this.subSections = [];

	this.subSections.push(new Inventory(this));
	//this.subSections.push(new Notifications(this));
	this.subSections.push(new Progress(this));
	if(global.job) {
		this.subSections.push(new Job(this));
	}
	this.subSections.push(new Journal(this));
	this.subSections.push(new Settings(this));
	this.subSections.push(new Quit(this));
}

InventoryViewer.prototype = {
	spriteSystems: {},
	items: [],
	selected: -1,
	subSelection: 0,
	subSections : [],
	state: 0,

	Update: function(timer, gamepad) {
		if(Input.WasDownPressed(gamepad)) {
			this.subSelection++;
			this.subSelection = this.subSelection % this.subSections.length;
		}

		if(Input.WasUpPressed(gamepad)) {
			this.subSelection--;
			if(this.subSelection < 0) this.subSelection = this.subSections.length - 1;
			this.subSelection = this.subSelection % this.subSections.length;
		}

		var result = this.subSections[this.subSelection].update(timer, gamepad);

		if(!this.initialRelease && Input.WasBackReleased(gamepad)) {
			this.initialRelease = true;
		} else if(this.initialRelease && Input.WasBackReleased(gamepad)) {
			return {
				result: 1
			};
		}

		return result;
	},

	Draw: function() {
        OP.texture2D.Render(this.background);

		OP.spriteSystem.Render(this.uiSpriteSystem.spriteSystem, this.screenCamera);

		OP.fontRender.Begin(this.fontManager36);
		this.fontManager36.SetAlign(OP.FONTALIGN.LEFT);
		OP.fontRender.Color(0.0, 0.7, 0.0);
		OP.fontRender("<", 50, -250 + this.subSelection * 50 + this.size.ScaledHeight / 2.0);

		for(var i = 0; i < this.subSections.length; i++) {
			if(i == this.subSelection) {
				OP.fontRender.Color(0.0, 0.7, 0.0);
			} else {
				OP.fontRender.Color(1.0, 1.0, 1.0);
			}
			OP.fontRender(this.subSections[i].text, 100, -250 + i * 50 + this.size.ScaledHeight / 2.0);
		}
		OP.fontRender.End();

		this.subSections[this.subSelection].render();
	},

	Exit: function() {

	}
};

module.exports = function() {
	return new InventoryViewer();
}
