var OP = require('OPengine').OP;
var MixPanel = require('../Utils/MixPanel.js');
var Input = require('../Utils/Input.js');

function BaseSelector(name, optionSheet, options) {
  this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
  this.background.Scale.Set(2, 2);
  this.fontManager = OP.fontManager.Setup('pixel.opf');

  var size = OP.render.Size();

  var sheet = 'BaseSelector';
  OP.cman.Load(sheet + '.opss');

  var selectorSprites = [];
  selectorSprites.push(OP.cman.Get(sheet + '/Selector'));
  selectorSprites.push(OP.cman.Get(sheet + '/SelectorOff'));
  selectorSprites.push(OP.cman.Get(sheet + '/SelectorPush'));
  selectorSprites.push(OP.cman.Get(sheet + '/SelectorTitleBackground'));
  selectorSprites.push(OP.cman.Get(sheet + '/BackButtonOff'));

  this.spriteSystem = OP.spriteSystem.Create(selectorSprites, 6, OP.SPRITESYSTEMALIGN.CENTER);

    var titleBg = OP.spriteSystem.Add(this.spriteSystem);
    titleBg.Position.Set(size.ScaledWidth / 2.0, size.ScaledHeight - 90);
    titleBg.Scale.Set(1000, 0.25);
    OP.spriteSystem.SetSprite(titleBg, 3);


      var backBtn = OP.spriteSystem.Add(this.spriteSystem);
      backBtn.Position.Set(75, size.ScaledHeight - 90);
      OP.spriteSystem.SetSprite(backBtn, 4);

  this.selectors = [];
  for(var i  = 0 ; i < 3; i++) {
    var sel = OP.spriteSystem.Add(this.spriteSystem);
    sel.Position.Set(200 + i * 300, 300);
    if(i != 0) OP.spriteSystem.SetSprite(sel, 1);
    this.selectors.push(sel);
  }

  this.camera = OP.cam.Ortho(0, 0, 10, 0, 0, 0, 0, 1, 0, 0.1, 20.0, 0, size.ScaledWidth, 0, size.ScaledHeight);

  this.name = name;

    this.options = options;
    OP.cman.Load(optionSheet + '.opss');

    var sprites = [];
    for(var i  = 0 ; i < this.options.length; i++) {
        sprites.push(OP.cman.Get(optionSheet + '/' + this.options[i].sprite));
    }
    this.optionsSpriteSystem = OP.spriteSystem.Create(sprites, 6, OP.SPRITESYSTEMALIGN.BOTTOM_CENTER);

    for(var i  = 0 ; i < this.options.length; i++) {
        var sprite = OP.spriteSystem.Add(this.optionsSpriteSystem);
        sprite.Position.Set(200 + i * 300, 300);
        var scale = this.options[i].scale || [ 1, 1];
        sprite.Scale.Set(scale[0], scale[1]);
        OP.spriteSystem.SetSprite(sprite, i);
    }
}

BaseSelector.prototype = {
    background: null,
    fontManager: null,
    selected: 0,
    selections: [],
    selectors: [],
    canSelect: true,

    Update: function(timer, gamepad) {

        if(Input.WasBackPressed(gamepad)) {
            global.AudioPlayer.PlayEffect('Audio/Close.wav');
            if(!this.selectedSprite) {
                return {
                    result: 1
                };
            }

            this.onExit && this.onExit();

            return  {
                result: 1
            };
        }

        if(this.canSelect && Input.WasLeftPressed(gamepad)) {
            OP.spriteSystem.SetSprite(this.selectors[this.selected], 1);
            this.selected--;
            if(this.selected < 0) this.selected = this.selectors.length - 1;
            this.selected = this.selected % this.selectors.length;
            OP.spriteSystem.SetSprite(this.selectors[this.selected], 0);
        }

        if(this.canSelect && Input.WasRightPressed(gamepad)) {
            OP.spriteSystem.SetSprite(this.selectors[this.selected], 1);
            this.selected++;
            this.selected = this.selected % this.selectors.length;
            OP.spriteSystem.SetSprite(this.selectors[this.selected], 0);
        }

        if(this.canSelect && Input.IsActionDown(gamepad)) {
            OP.spriteSystem.SetSprite(this.selectors[this.selected], 2);
        }
        if(this.canSelect && Input.WasActionReleased(gamepad)) {
            OP.spriteSystem.SetSprite(this.selectors[this.selected], 0);
        }

        if(this.canSelect && Input.WasActionPressed(gamepad)) {
            this.onSelected && this.onSelected(this.selected);
            global.AudioPlayer.PlayEffect('Audio/Selection.wav');
        } else if(!this.canSelect && Input.WasActionPressed(gamepad)) {
            global.AudioPlayer.PlayEffect('Audio/Denied.wav');
        }


        OP.spriteSystem.Update(this.optionsSpriteSystem, timer);
        OP.spriteSystem.Update(this.spriteSystem, timer);

        return {
            result: 0
        };
    },

    Draw: function() {
        OP.texture2D.Render(this.background);

        OP.render.Depth(0);
        OP.render.Blend(1);

        OP.spriteSystem.Render(this.spriteSystem, this.camera);
        OP.spriteSystem.Render(this.optionsSpriteSystem, this.camera);

        this.onDraw && this.onDraw();

			OP.fontRender.Begin(this.fontManager);
			this.fontManager.SetAlign(OP.FONTALIGN.CENTER);

            for(var i = 0; i < this.options.length; i++) {
              if(this.canSelect && this.selected == i) {
          		    OP.fontRender.Color(50.0 / 255.0, 165.0 / 255.0, 84.0 / 255.0);
              } else {
            		  OP.fontRender.Color(1.0, 1.0, 1.0);
              }
              OP.fontRender(this.options[i].name, 200 + i * 300, 450);
              if(this.options[i].subDesc) {
                  OP.fontRender(this.options[i].subDesc, 200 + i * 300, 500);
              }
            }

    		OP.fontRender.Color(1, 1, 1);
			OP.fontRender(this.name, 1280 / 2.0, 60);


            if(this.selectedName) {
                OP.fontRender.Color(1.0, 1.0, 1.0);

                // OP.fontRender('Result', 200 + 3 * 300, 200);

                // TODO: Move to utility
                var words = this.selectedName.split(' ');
                var text = '';
                var line = 0;
                for(var i = 0; i < words.length; i++) {
                    var s = text + words[i];
                    if(s.length > 15) {
                        OP.fontRender(text, 200 + 3 * 300, 500 + line * 50);
                        line++;
                        text = '';
                    }

                    text += words[i] + ' ';

                    if(i == words.length - 1) {
                        OP.fontRender(text, 200 + 3 * 300, 500 + line * 50);
                    }
                }

            }

			OP.fontRender.End();
    },

    Exit: function() {
        OP.spriteSystem.Destroy(this.spriteSystem);
    }
};

module.exports = BaseSelector;
