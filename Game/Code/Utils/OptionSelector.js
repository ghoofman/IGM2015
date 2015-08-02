var OP = require('OPengine').OP;
var Input = require('./Input.js');

function OptionSelector(text, options) {
  this.text = text;
  this.options = options;

      this.fontManager = OP.fontManager.Setup('pixel.opf');
      this.fontManager72 = OP.fontManager.Setup('pixel72.opf');
      this.fontManager36 = OP.fontManager.Setup('pixel36.opf');
      this.fontManager24 = OP.fontManager.Setup('pixel24.opf');

  	this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
  	this.background.Scale.Set(2, 2);

	var size = OP.render.Size();
	this.size = size;
	this.camera = OP.cam.Ortho(0, 0, -100, 0, 0, 0, 0, 1, 0, 0.1,250.0, 0, size.ScaledWidth, 0, size.ScaledHeight);

	// The basic effect to use for all rendering (for now)
	this.effect = OP.effect.Gen('Colored3D.vert', 'Colored.frag', OP.ATTR.POSITION | OP.ATTR.NORMAL | OP.ATTR.COLOR, 'Voxel Shader', global.player.mesh.VertexSize);

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
	titleBg.Position.Set(size.ScaledWidth / 2.0, 240);
	titleBg.Scale.Set(1000, 1);
	OP.spriteSystem.SetSprite(titleBg, 3);


	this.btn = OP.spriteSystem.Add(this.spriteSystem);
	this.btn.Position.Set(size.ScaledWidth - 100, 210);
}

OptionSelector.prototype = {
  text: '',
  options: null,
  selected: 0,

  Update: function(gamepad) {

      if(this.options) {
          if(Input.WasUpPressed(gamepad)) {
              this.selected--;
              if(this.selected < 0) this.selected = this.options.length - 1;
          }
          if(Input.WasDownPressed(gamepad)) {
              this.selected++;
          }
          this.selected = this.selected % this.options.length;
          if(Input.WasActionPressed(gamepad)) {
              return this.options[this.selected].select && this.options[this.selected].select();
          }
      } else {
          if(Input.WasActionPressed(gamepad)) {
            return {
                result: 1
            };
        }
      }

      return {
          result: 0
      };
  },

  Render: function(fontManager) {
      fontManager = fontManager || this.fontManager;
      
      OP.texture2D.Render(this.background);

      OP.spriteSystem.Render(this.spriteSystem, this.camera);

      fontManager.SetAlign(OP.FONTALIGN.LEFT);
    	OP.fontRender.Begin(fontManager);
    	OP.fontRender(this.text, 300, 270);
      	OP.fontRender.End();

        if(this.options) {
          	OP.fontRender.Begin(this.fontManager36);
              for(var i = 0; i < this.options.length; i++) {
                if(this.selected == i) {
              		OP.fontRender.Color(0.5,1.0,0.5);
            		OP.fontRender('<', 320, 335 + i * 50);
                } else {
              		OP.fontRender.Color(1,1,1);
                }
            		OP.fontRender(this.options[i].text, 350, 335 + i * 50);
              }

        	OP.fontRender.End();
        }


		OP.render.Depth(1);
		OP.render.DepthWrite(1);
		global.player.DrawPos([-150,400,-40], [0.3, -0.7], 6, this.material, this.camera);

		OP.fontRender.Begin(this.fontManager72);
        this.fontManager72.SetAlign(OP.FONTALIGN.LEFT);
	  	OP.fontRender.Color(1,1,1);
		OP.fontRender('Me', 300, 172);

      	OP.fontRender.End();
  }
};

module.exports = OptionSelector;
