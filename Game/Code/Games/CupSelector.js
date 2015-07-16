var OP = require('OPengine').OP;
var MixPanel = require('../Utils/MixPanel.js');
var BaseSelector = require('./BaseSelector.js');

module.exports = function(data) {

    if(global.inventory && global.inventory.cup && global.inventory.cup.coffee) return null;

    var CupSelector = new BaseSelector('Cup', 'CoffeeSelector', [
        {
            id : 1,
            name : 'Short',
            sprite: 'CupTall-iso',
            scale: [ 0.5, 0.5 ]
        },
        {
            id : 2,
            name : 'Tall',
            sprite: 'CupGrande-iso',
            scale: [ 0.5, 0.5 ]
        },
        {
            id : 3,
            name : 'Grande',
            sprite: 'CupVenti-iso',
            scale: [ 0.5, 0.5 ]
        }
    ]);

    CupSelector.onExit = function() {
      if(!this.selectedSprite) return 1;
      if(!global.inventory) global.inventory = {};
      global.inventory.cup = {
          id: this.selectedSprite.id,
          type: this.options[this.selectedSprite.id].name
      }
      return 1;
    };

    CupSelector.onSelected = function(id) {
      if(this.selectedSprite) {
        OP.spriteSystem.Remove(this.optionsSpriteSystem, this.selectedSprite);
      }
      this.selectedSprite = OP.spriteSystem.Add(this.optionsSpriteSystem);
      this.selectedSprite.Position.Set(200 + 3 * 300, 300);
      this.selectedSprite.Scale.Set(0.75, 0.75);
      this.selectedSprite.id = id;
      this.selectedName = this.options[id].name;
      OP.spriteSystem.SetSprite(this.selectedSprite, id);
      MixPanel.Track('Selected Cup', { size: id });
    };

    if(global.inventory && global.inventory.cup) {
        var id = global.inventory.cup.id;
        CupSelector.selectedSprite = OP.spriteSystem.Add(CupSelector.optionsSpriteSystem);
        CupSelector.selectedSprite.Position.Set(200 + 3 * 300, 300);
        CupSelector.selectedSprite.Scale.Set(0.75, 0.75);
        CupSelector.selectedSprite.id = id;
        CupSelector.selectedName = CupSelector.options[id].name;

        OP.spriteSystem.SetSprite(CupSelector.selectedSprite, id);
        MixPanel.Track('Selected Cup', { size: id });
    }
    return CupSelector;
}
