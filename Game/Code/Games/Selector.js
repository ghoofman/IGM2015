var OP = require('OPengine').OP;

function Selector() {
  this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
  this.background.Scale.Set(2, 2);
  // this.titleBackground = OP.texture2D.Create(OP.cman.LoadGet('SelectorTitleBackground.png'));
  // this.titleBackground.Scale.Set(500, 1);
  this.fontManager = OP.fontManager.Setup('pixel.opf');

  var size = OP.render.Size();

  var sheet = 'CoffeeSelector';

  this.options = [
    {
      id: 1,
      name: 'Short',
      sprite: 'CupTall-iso'
    },
    {
      id: 2,
      name: 'Tall',
      sprite: 'CupGrande-iso'
    },
    {
      id: 3,
      name: 'Grande',
      sprite: 'CupVenti-iso'
    }
  ];

  OP.cman.Load(sheet + '.opss');

  var selectorSprites = [];
  selectorSprites.push(OP.cman.Get(sheet + '/Selector'));
  selectorSprites.push(OP.cman.Get(sheet + '/SelectorOff'));
  selectorSprites.push(OP.cman.Get(sheet + '/SelectorPush'));
  selectorSprites.push(OP.cman.Get(sheet + '/SelectorTitleBackground'));

  var sprites = [];
  for(var i  = 0 ; i < this.options.length; i++) {
    sprites.push(OP.cman.Get(sheet + '/' + this.options[i].sprite));
  }

  this.spriteSystem = OP.spriteSystem.Create(selectorSprites, 6, OP.SPRITESYSTEMALIGN.CENTER);
  this.spriteSystem2 = OP.spriteSystem.Create(sprites, 6, OP.SPRITESYSTEMALIGN.BOTTOM_CENTER);

  var titleBg = OP.spriteSystem.Add(this.spriteSystem);
  titleBg.Position.Set(size.ScaledWidth / 2.0, size.ScaledHeight - 90);
  titleBg.Scale.Set(1000, 0.25);
  OP.spriteSystem.SetSprite(titleBg, 3);

  for(var i  = 0 ; i < this.options.length; i++) {
    var sel = OP.spriteSystem.Add(this.spriteSystem);
    sel.Position.Set(200 + i * 300, 300);
    if(i != 0) OP.spriteSystem.SetSprite(sel, 1);
    this.options[i].selector = sel;

    var sprite = OP.spriteSystem.Add(this.spriteSystem2);
    sprite.Position.Set(200 + i * 300, 300);
    sprite.Scale.Set(0.5, 0.5);
    OP.spriteSystem.SetSprite(sprite, i);
  }

  this.camera = OP.cam.Ortho(0, 0, 10, 0, 0, 0, 0, 1, 0, 0.1, 20.0, 0, size.ScaledWidth, 0, size.ScaledHeight);

  if(global.inventory) {
    if(global.inventory.cup != undefined && global.inventory.cup != null) {
      this.selectedSprite = OP.spriteSystem.Add(this.spriteSystem2);
      this.selectedSprite.Position.Set(200 + 3 * 300, 300);
      this.selectedSprite.Scale.Set(0.75, 0.75);
      this.selectedSprite.id = global.inventory.cup;
      OP.spriteSystem.SetSprite(this.selectedSprite, global.inventory.cup);
    }
  }
}

Selector.prototype = {
    background: null,
    fontManager: null,
    selected: 0,
    selections: [],

    Update: function(timer, gamepad) {
        if(OP.keyboard.WasPressed(OP.KEY.Q)) {
            if(!this.selectedSprite) return 1;

            if(!global.inventory) global.inventory = {};
            global.inventory.cup = this.selectedSprite.id;
            return 1;
        }

        if(OP.keyboard.WasPressed(OP.KEY.A)) {
            OP.spriteSystem.SetSprite(this.options[this.selected].selector, 1);
            this.selected--;
            if(this.selected < 0) this.selected = this.options.length - 1;
            this.selected = this.selected % this.options.length;
            OP.spriteSystem.SetSprite(this.options[this.selected].selector, 0);
        }

        if(OP.keyboard.WasPressed(OP.KEY.D)) {
            OP.spriteSystem.SetSprite(this.options[this.selected].selector, 1);
            this.selected++;
            this.selected = this.selected % this.options.length;
            OP.spriteSystem.SetSprite(this.options[this.selected].selector, 0);
        }

        if(OP.keyboard.IsDown(OP.KEY.E)) {
            OP.spriteSystem.SetSprite(this.options[this.selected].selector, 2);
        }
        if(OP.keyboard.WasReleased(OP.KEY.E)) {
            OP.spriteSystem.SetSprite(this.options[this.selected].selector, 0);
        }

        if(OP.keyboard.WasPressed(OP.KEY.E)) {
            if(this.selectedSprite) {
              OP.spriteSystem.Remove(this.spriteSystem2, this.selectedSprite);
            }
            this.selectedSprite = OP.spriteSystem.Add(this.spriteSystem2);
            this.selectedSprite.Position.Set(200 + 3 * 300, 300);
            this.selectedSprite.Scale.Set(0.75, 0.75);
            this.selectedSprite.id = this.selected;
            OP.spriteSystem.SetSprite(this.selectedSprite, this.selected);
        }

        OP.spriteSystem.Update(this.spriteSystem, timer);
        OP.spriteSystem.Update(this.spriteSystem2, timer);

        return 0;
    },

    Draw: function() {
        OP.texture2D.Render(this.background);


        OP.render.Depth(0);
        OP.render.Blend(1);

        OP.spriteSystem.Render(this.spriteSystem, this.camera);
        OP.spriteSystem.Render(this.spriteSystem2, this.camera);

				OP.fontRender.Begin(this.fontManager);
				this.fontManager.SetAlign(OP.FONTALIGN.CENTER);

        for(var i = 0; i < this.options.length; i++) {
          if(this.selected == i) {
      		    OP.fontRender.Color(50.0 / 255.0, 165.0 / 255.0, 84.0 / 255.0);
          } else {
        		  OP.fontRender.Color(1.0, 1.0, 1.0);
          }
          OP.fontRender(this.options[i].name, 200 + i * 300, 450);
        }

        if(this.selectedSprite) {
            OP.fontRender.Color(1.0, 1.0, 1.0);
            OP.fontRender(this.options[this.selectedSprite.id].name, 200 + 3 * 300, 450);
        }

    		OP.fontRender.Color(1, 1, 1);
				OP.fontRender('Cup Selection', 1280 / 2.0, 60);

				OP.fontRender.End();
    },

    Exit: function() {

    }
};

module.exports = Selector;
