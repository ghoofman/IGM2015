var OP = require('OPengine').OP;

function Talk(character, text, options, complete) {
	this.character = character;
	this.text = text;
	this.options = options;
	this.complete = complete;

    this.fontManager = OP.fontManager.Setup('pixel.opf');
	this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
	this.background.Scale.Set(2, 2);

	var size = OP.render.Size();
	this.camera = OP.cam.Ortho(0, 0, -100, 0, 0, 0, 0, 1, 0, 0.1,250.0, 0, size.ScaledWidth, 0, size.ScaledHeight);

	// The basic effect to use for all rendering (for now)
	this.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', this.character.mesh.VertexSize);

	// The base material to use for all rendering (for now)
	this.material = OP.material.Create(this.effect);

	var sheet = 'BaseSelector';
	OP.cman.Load(sheet + '.opss');

	var selectorSprites = [];
	selectorSprites.push(OP.cman.Get(sheet + '/Action'));
	selectorSprites.push(OP.cman.Get(sheet + '/ActionOff'));
	selectorSprites.push(OP.cman.Get(sheet + '/ActionPush'));
	selectorSprites.push(OP.cman.Get(sheet + '/ChatBackground'));

	this.spriteSystem = OP.spriteSystem.Create(selectorSprites, 2, OP.SPRITESYSTEMALIGN.BOTTOM_CENTER);

	var titleBg = OP.spriteSystem.Add(this.spriteSystem);
	titleBg.Position.Set(size.ScaledWidth / 2.0, 40);
	titleBg.Scale.Set(1000, 1);
	OP.spriteSystem.SetSprite(titleBg, 3);


	this.btn = OP.spriteSystem.Add(this.spriteSystem);
	this.btn.Position.Set(size.ScaledWidth - 100, 10);
}

Talk.prototype = {
	selected: 0,

	Update: function(timer, gamepad) {
		if(this.options) {
	        if(OP.keyboard.WasPressed(OP.KEY.W) || gamepad.WasPressed(OP.gamePad.DPAD_UP) || gamepad.LeftThumbNowUp()) {
	            this.selected--;
	            if(this.selected < 0) this.selected = this.options.length - 1;
	        }
	        if(OP.keyboard.WasPressed(OP.KEY.S) || gamepad.WasPressed(OP.gamePad.DPAD_DOWN) || gamepad.LeftThumbNowDown()) {
	            this.selected++;
	        }
	        this.selected = this.selected % this.options.length;
		}
		//
	    // if(OP.keyboard.IsDown(OP.KEY.E) || gamepad.IsDown(OP.gamePad.Y)) {
	    //     OP.spriteSystem.SetSprite(this.btn, 2);
	    // }

        if(OP.keyboard.WasPressed(OP.KEY.ENTER) || OP.keyboard.WasPressed(OP.KEY.E) || gamepad.WasPressed(OP.gamePad.Y)) {

			if(this.options && this.options[this.selected].select) {
				var result = this.options[this.selected].select();
				this.complete && this.complete();
				return {
					result: 1,
					next: result
				};
			} else {
				this.complete && this.complete();
				return {
					result: 1
				};
			}
		}

        OP.spriteSystem.Update(this.spriteSystem, timer);

		return {
			result: 0
		};
	},

	Draw: function() {
        OP.texture2D.Render(this.background);

		OP.spriteSystem.Render(this.spriteSystem, this.camera);


        this.fontManager.SetAlign(OP.FONTALIGN.LEFT);
      	OP.fontRender.Begin(this.fontManager);
		var offset = 0;
		if(this.options && this.options.length == 3) offset = 25;
      	OP.fontRender(this.text, 250, 475 - offset);
		if(this.options) {
	        for(var i = 0; i < this.options.length; i++) {
	          if(this.selected == i) {
	    		OP.fontRender.Color(0.5,1.0,0.5);
	  		  	OP.fontRender('<', 265, 525 + i * 50 - offset);
	          } else {
	    		OP.fontRender.Color(1,1,1);
	          }
			  OP.fontRender(this.options[i].text, 300, 525 + i * 50 - offset);
	        }
		}
      	OP.fontRender.End();

		OP.render.Depth(1);
		OP.render.DepthWrite(1);
		this.character.DrawPos([-100,140,-40], [0.3, -0.7], 6, this.material, this.camera);
	},

	Exit: function() {

	}
};

module.exports = Talk;
