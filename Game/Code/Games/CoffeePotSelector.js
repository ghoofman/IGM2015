var OP = require('OPengine').OP;
var MixPanel = require('../Utils/MixPanel.js');
var BaseSelector = require('./BaseSelector.js');


module.exports = function(data) {
    if(!global.inventory || global.inventory.cup == undefined || global.inventory.cup == null) return null;

    // Cup has already been filled
    if(global.inventory && global.inventory.cup && global.inventory.cup.coffee) return null;

    var CoffeePotSelector = new BaseSelector('Coffee', 'CoffeeSelector', [
        {
            id : 1,
            name : 'Regular',
            sprite: 'PotRegular-iso',
            scale: [ 0.5, 0.5 ]
        },
        {
            id : 2,
            name : 'Bold',
            sprite: 'PotBold-iso',
            scale: [ 0.5, 0.5 ]
        },
        {
            id : 3,
            name : 'Decaf',
            sprite: 'PotDecaf-iso',
            scale: [ 0.5, 0.5 ]
        }
    ]);

    var sprites = [
        OP.cman.Get('CoffeeSelector/CupTallBlack-iso'),
        OP.cman.Get('CoffeeSelector/CupGrandeBlack-iso'),
        OP.cman.Get('CoffeeSelector/CupVentiBlack-iso'),
        OP.cman.Get('CoffeeSelector/CupTallEmpty-iso'),
        OP.cman.Get('CoffeeSelector/CupGrandeEmpty-iso'),
        OP.cman.Get('CoffeeSelector/CupVentiEmpty-iso')
    ];

    var spriteSystem = OP.spriteSystem.Create(sprites, 6, OP.SPRITESYSTEMALIGN.BOTTOM_CENTER);

    CoffeePotSelector.selectedSprite = OP.spriteSystem.Add(spriteSystem);
    CoffeePotSelector.selectedSprite.Position.Set(200 + 3 * 300, 300);
    CoffeePotSelector.selectedSprite.Scale.Set(0.75, 0.75);
    CoffeePotSelector.selectedSprite.id = -1;
    CoffeePotSelector.selectedName = global.inventory.cup.type;
    OP.spriteSystem.SetSprite(CoffeePotSelector.selectedSprite, global.inventory.cup.id + 3);

    CoffeePotSelector.onExit = function() {
      if(!this.selectedSprite) return 1;
      if(!global.inventory) global.inventory = {};
      global.inventory.cup.coffee = {
          id: this.selectedSprite.id,
          type: this.options[this.selectedSprite.id].name
      }
      return 1;
    };

    CoffeePotSelector.onSelected = function(id) {
      this.selectedSprite.id = id;
      this.selectedName = global.inventory.cup.type + ' ' + this.options[id].name + ' Coffee';
      OP.spriteSystem.SetSprite(this.selectedSprite, global.inventory.cup.id);

      MixPanel.Track('Selected Cup', { size: id });

      OP.spriteSystem.SetSprite(this.selectors[this.selected], 1);
      this.canSelect = false;
    };

    CoffeePotSelector.onDraw = function() {
        OP.spriteSystem.Render(spriteSystem, this.camera);
    }

    return CoffeePotSelector;
}
