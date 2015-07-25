var OP = require('OPengine').OP;
var MixPanel = require('../Utils/MixPanel.js');
var BaseSelector = require('./BaseSelector.js');

function requires() {

    if(!global.inventory.Has('cup')) {
        return {
            text: 'Need a cup'
        };
    }

    // Cup has already been filled
    if(global.inventory.Get('cup').coffee) {
        return {
            text: 'Need an empty cup'
        };
    }

    return null;

}

module.exports = function(data) {

    var req = requires();

    if(req != null) {
        global.AudioPlayer.PlayEffect('Audio/Denied.wav');
        return;
    }

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

    var filled = [
        'CupTallBlack-iso',
        'CupGrandeBlack-iso',
        'CupVentiBlack-iso'
    ]

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
    var cup = global.inventory.Get('cup');
    CoffeePotSelector.selectedName = cup.type;
    OP.spriteSystem.SetSprite(CoffeePotSelector.selectedSprite, cup.id + 3);

    CoffeePotSelector.onExit = function() {
      if(!this.selectedSprite) return 1;
      //if(!global.inventory) global.inventory = {};
      if(this.selectedSprite.id > -1){

          var cup = global.inventory.Get('cup');

          global.inventory.Update('cup', {
              sheet: 'CoffeeSelector',
              item: filled[cup.id],
              coffee: {
                  id: this.selectedSprite.id,
                  type: this.options[this.selectedSprite.id].name
              },
              text: cup.type + ' ' + this.options[this.selectedSprite.id].name + ' Coffee',
              desc: [ "I better hurry up, it's getting cold." ]
          });
        //
        //   global.inventory.Remove(global.inventory.cup.sheet, global.inventory.cup.item);
          //
        //   global.inventory.Add('CoffeeSelector', filled[global.inventory.cup.id]);
        //   global.inventory.cup.sheet = 'CoffeeSelector';
        //   global.inventory.cup.item = filled[global.inventory.cup.id];
          //
        //   global.inventory.cup.coffee = {
        //       id: this.selectedSprite.id,
        //       type: this.options[this.selectedSprite.id].name
        //   }
        }
      return 1;
    };

    CoffeePotSelector.onSelected = function(id) {
      this.selectedSprite.id = id;
      this.selectedName = cup.type + ' ' + this.options[id].name + ' Coffee';
      OP.spriteSystem.SetSprite(this.selectedSprite, cup.id);

      MixPanel.Track('Selected Cup', { size: id });

      OP.spriteSystem.SetSprite(this.selectors[this.selected], 1);
      this.canSelect = false;
    };

    CoffeePotSelector.onDraw = function() {
        OP.spriteSystem.Render(spriteSystem, this.camera);
    }

    return CoffeePotSelector;
}

module.exports.requires = requires;
