var OP = require('OPengine').OP;

function EndOfDay(character) {

    this.fontManager = OP.fontManager.Setup('pixel.opf');
    this.fontManager72 = OP.fontManager.Setup('pixel72.opf');
	this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
	this.background.Scale.Set(2, 2);

	// The basic effect to use for all rendering (for now)
	this.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', global.player.mesh.VertexSize);

	// The base material to use for all rendering (for now)
	this.material = OP.material.Create(this.effect);

	this.size = OP.render.Size();
	this.camera = OP.cam.Ortho(0, 0, -100, 0, 0, 0, 0, 1, 0, 0.1,250.0, 0, this.size.ScaledWidth, 0, this.size.ScaledHeight);

	var sheet = 'BaseSelector';
	OP.cman.Load(sheet + '.opss');

	var selectorSprites = [];
	selectorSprites.push(OP.cman.Get(sheet + '/Action'));
	selectorSprites.push(OP.cman.Get(sheet + '/ActionOff'));
	selectorSprites.push(OP.cman.Get(sheet + '/ActionPush'));
	selectorSprites.push(OP.cman.Get(sheet + '/ProgressBackground'));

	this.spriteSystem = OP.spriteSystem.Create(selectorSprites, 2, OP.SPRITESYSTEMALIGN.BOTTOM_CENTER);

	var titleBg = OP.spriteSystem.Add(this.spriteSystem);
	titleBg.Position.Set(this.size.ScaledWidth / 2.0, 0);
	titleBg.Scale.Set(1000, 1);
	OP.spriteSystem.SetSprite(titleBg, 3);


	this.btn = OP.spriteSystem.Add(this.spriteSystem);
	this.btn.Position.Set(this.size.ScaledWidth - 100, 10);



	this.pocket = global.game.cash || 0;

	this.tips = global.tips || 0;

	if(global.job && global.job.rate) {
		this.payRate = global.job.rate;
		this.pay = this.payRate * 8; // TODO: change to actual time worked
	} else {
		this.pay = 0;
		this.payRate = 0;
	}
	this.taxes = (this.tips + this.pay) * 0.33;

	this.rent = (global.apartment && global.apartment.rent) || 0;
	this.rentRate = this.rent * 30;

	this.loans = global.game.loans || 0;
	this.loansRate = this.loans * 30;

	this.food = 10;

	this.net = this.pocket + this.pay + this.tips - this.taxes - this.rent - this.loans - this.food;
}

EndOfDay.prototype = {

	Update: function(timer, gamepad) {
		if(OP.keyboard.WasPressed(OP.KEY.ENTER) || OP.keyboard.WasPressed(OP.KEY.E) || gamepad.WasPressed(OP.gamePad.Y)) {
			return {
				result: 1
			}
		}
		return {
			result: 0
		};
	},

	Draw: function() {
		// Draw background fade
        OP.texture2D.Render(this.background);

		// Draw edges
		OP.spriteSystem.Render(this.spriteSystem, this.camera);

		// Display finances

		OP.fontRender.Begin(this.fontManager72);
		this.fontManager72.SetAlign(OP.FONTALIGN.CENTER);
		OP.fontRender.Color(1.0, 1.0, 1.0);
	    OP.fontRender('End of Day', this.size.ScaledWidth / 2.0, 50);
		OP.fontRender.End();

		OP.fontRender.Begin(this.fontManager);
		this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
		OP.fontRender.Color(50.0 / 255.0, 165.0 / 255.0, 84.0 / 255.0);


	    OP.fontRender('Cash', 400, 150);
	    OP.fontRender('$' + this.pocket.toFixed(2), 600, 150);

	    OP.fontRender('Tips', 400, 200);
	    OP.fontRender('$' + this.tips.toFixed(2), 600, 200);

	    OP.fontRender('Pay', 400, 250);
	    OP.fontRender('$' + this.pay.toFixed(2), 600, 250);
	    OP.fontRender('$' + this.payRate.toFixed(2) + ' / hr', 800, 250);

		if(this.net >= 0) {
		    OP.fontRender('Net', 400, 600);
		    OP.fontRender('$' + this.net.toFixed(2), 600, 600);
		}

		OP.fontRender.Color(1.0, 0, 0);

	    OP.fontRender('Rent', 400, 300);
	    OP.fontRender('-$' + this.rent.toFixed(2), 600, 300);
	    OP.fontRender('$' + this.rentRate.toFixed(2) + ' / mo', 800, 300);

	    OP.fontRender('Loans', 400, 350);
	    OP.fontRender('-$' + this.loans.toFixed(2), 600, 350);
	    OP.fontRender('$' + this.loansRate.toFixed(2) + ' / mo', 800, 350);

	    OP.fontRender('Taxes', 400, 400);
	    OP.fontRender('-$' + this.taxes.toFixed(2), 600, 400);

	    OP.fontRender('Food', 400, 450);
	    OP.fontRender('-$' + this.food.toFixed(2), 600, 450);

		if(this.net < 0) {
		    OP.fontRender('Net', 400, 600);
		    OP.fontRender('-$' + Math.abs(this.net).toFixed(2), 600, 600);
		}

		OP.fontRender.End();

		OP.render.Depth(1);
		OP.render.DepthWrite(1);
		global.player.DrawPos([-100,140,-40], [0.3, -0.7], 6, this.material, this.camera);

	},

	Exit: function() {

	}

};

module.exports = function() {
	return new EndOfDay();
}
