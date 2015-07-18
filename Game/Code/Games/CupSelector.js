var OP = require('OPengine').OP;
var MixPanel = require('../Utils/MixPanel.js');
var BaseSelector = require('./BaseSelector.js');

function requires() {

    if(global.inventory &&
        global.inventory.cup &&
        global.inventory.cup.coffee) {
            return {
                text: 'Already have a filled cup'
            };
        }

    return null;

}

module.exports = function(data) {

    var req = requires();

    if(req != null) return;

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

      global.inventory.Add('CoffeeSelector', this.options[this.selectedSprite.id].sprite);
      global.inventory.cup = {
          id: this.selectedSprite.id,
          type: this.options[this.selectedSprite.id].name,
          sheet: 'CoffeeSelector',
          item: this.options[this.selectedSprite.id].sprite
      }
      return 1;
    };

    CupSelector.onSelected = function(id) {
      if(this.selectedSprite) {
        OP.spriteSystem.Remove(this.optionsSpriteSystem, this.selectedSprite);
      }
      this.selectedSprite = OP.spriteSystem.Add(this.optionsSpriteSystem);
      this.selectedSprite.Position.Set(200 + 3 * 300, 250);
      this.selectedSprite.Scale.Set(0.75, 0.75);
      this.selectedSprite.id = id;
      this.selectedName = this.options[id].name;
      OP.spriteSystem.SetSprite(this.selectedSprite, id);
      MixPanel.Track('Selected Cup', { size: id });
    };

    if(global.inventory && global.inventory.cup) {
        var id = global.inventory.cup.id;
        CupSelector.selectedSprite = OP.spriteSystem.Add(CupSelector.optionsSpriteSystem);
        CupSelector.selectedSprite.Position.Set(200 + 3 * 300, 250);
        CupSelector.selectedSprite.Scale.Set(0.75, 0.75);
        CupSelector.selectedSprite.id = id;
        CupSelector.selectedName = CupSelector.options[id].name;

        OP.spriteSystem.SetSprite(CupSelector.selectedSprite, id);
        MixPanel.Track('Selected Cup', { size: id });
    }

    return CupSelector;
}

module.exports.requires = requires;
