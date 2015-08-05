var OP = require('OPengine').OP;
var MixPanel = require('../Utils/MixPanel.js');
var BaseSelector = require('./BaseSelector.js');

module.exports = function(data) {

    var DifficultySelector = new BaseSelector('How long can you survive?', 'CoffeeSelector', [
        {
            id : 1,
            name : '3 Days',
            sprite: 'Easy-iso',
            scale: [ 0.5, 0.5 ],
			subDesc: 'Easy',
            day: 4
        },
        {
            id : 2,
            name : '5 Days',
            sprite: 'Hard-iso',
            scale: [ 0.5, 0.5 ],
			subDesc: 'Hard',
            day: 6
        },
        {
            id : 3,
            name : '7 Days',
            sprite: 'Extreme-iso',
            scale: [ 0.5, 0.5 ],
			subDesc: 'Extreme',
            day: 8
        }
    ]);

    DifficultySelector.onExit = function() {
    //   if(!this.selectedSprite) return 1;
	  //
    //   global.inventory.Set('cup', {
    //       id: this.selectedSprite.id,
    //       type: this.options[this.selectedSprite.id].name,
    //       sheet: 'CoffeeSelector',
    //       item: this.options[this.selectedSprite.id].sprite,
    //       text: this.options[this.selectedSprite.id].name + " cup",
    //       desc: [ ]
    //   });

      return 1;
    };

    DifficultySelector.onSelected = function(id) {
      if(this.selectedSprite) {
        OP.spriteSystem.Remove(this.optionsSpriteSystem, this.selectedSprite);
      }
      this.selectedSprite = OP.spriteSystem.Add(this.optionsSpriteSystem);
      this.selectedSprite.Position.Set(200 + 3 * 300, 250);
      this.selectedSprite.Scale.Set(0.75, 0.75);
      this.selectedSprite.id = id;
      this.selectedSprite.day = this.options[id].day;
      this.selectedName = this.options[id].name;
      OP.spriteSystem.SetSprite(this.selectedSprite, id);
    //   MixPanel.Track('Selected Cup', { size: id });
    };
	//
    // if(global.inventory && global.inventory.cup) {
    //     var id = global.inventory.cup.id;
    //     DifficultySelector.selectedSprite = OP.spriteSystem.Add(DifficultySelector.optionsSpriteSystem);
    //     DifficultySelector.selectedSprite.Position.Set(200 + 3 * 300, 250);
    //     DifficultySelector.selectedSprite.Scale.Set(0.75, 0.75);
    //     DifficultySelector.selectedSprite.id = id;
    //     DifficultySelector.selectedName = DifficultySelector.options[id].name;
	//
    //     OP.spriteSystem.SetSprite(DifficultySelector.selectedSprite, id);
    //     MixPanel.Track('Selected Cup', { size: id });
    // }

    return DifficultySelector;
}
