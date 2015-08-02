var OP = require('OPengine').OP;
var MixPanel = require('../Utils/MixPanel.js');
var BaseSelector = require('./BaseSelector.js');

function requires() {

    if(!global.inventory.Has('basket')) {
        return {
            text: 'Need a basket'
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

    var FruitSelector = new BaseSelector('Fruit', 'CoffeeSelector', [
        {
            id : 1,
            name : 'Apple $0.75',
            sprite: 'GroceryApple-iso',
            scale: [ 0.5, 0.5 ],
            actualName: 'Apple',
            cost: 0.75,
            bites: 2,
            desc: [ 'A shiny apple.', '[ Fills 1 hunger ]', '2 bites remains' ]
        },
        {
            id : 2,
            name : 'Banana $0.50',
            sprite: 'GroceryBanana-iso',
            scale: [ 0.5, 0.5 ],
            actualName: 'Banana',
            cost: 0.50,
            bites: 1,
            desc: ['A slightly squishy banana.', '[ Fills 1 hunger ]', '1 bite remains']
        },
        {
            id : 3,
            name : 'Berries $1.00',
            sprite: 'GroceryBlueberries-iso',
            scale: [ 0.5, 0.5 ],
            actualName: 'Berries',
            cost: 1.00,
            bites: 3,
            desc: [ 'Blueberries. They turn my fingers blue.', '[ Fills 1 hunger ]', '3 bites remain']
        }
    ]);

    FruitSelector.onExit = function() {
      if(!this.selectedSprite) return 1;

	  var basket = global.inventory.Get('basket');
	  basket.items = basket.items || [];
      basket.names = basket.names || {};

      if(!basket.names[this.options[this.selectedSprite.id].name]) {
          var item = {
              id: this.selectedSprite.id,
              type: this.options[this.selectedSprite.id].name,
              sheet: 'CoffeeSelector',
              item: this.options[this.selectedSprite.id].sprite,
              text: this.options[this.selectedSprite.id].actualName,
              desc: this.options[this.selectedSprite.id].desc,
              cost: this.options[this.selectedSprite.id].cost,
              Entity: {
                  amount: this.options[this.selectedSprite.id].bites,
                  Interact: function() {
                      if(global.currentScene.AddAHunger()) {
                          this.amount--;
                          var b = ' bites remain';
                          if(this.amount == 1) b = ' bite remains';
                          item.desc[2] = this.amount + b;
                          if(this.amount == 0) return true;
                          return false;
                      }
                      return false;
                  }
              }
          };

    	  basket.items.push(item);
          basket.names[this.options[this.selectedSprite.id].name] = true;
      }

      return 1;
    };

    FruitSelector.onSelected = function(id) {
      if(this.selectedSprite) {
        OP.spriteSystem.Remove(this.optionsSpriteSystem, this.selectedSprite);
      }
      this.selectedSprite = OP.spriteSystem.Add(this.optionsSpriteSystem);
      this.selectedSprite.Position.Set(200 + 3 * 300, 250);
      this.selectedSprite.Scale.Set(0.75, 0.75);
      this.selectedSprite.id = id;
      this.selectedName = this.options[id].name;
      OP.spriteSystem.SetSprite(this.selectedSprite, id);
      MixPanel.Track('Selected Fruit', { size: id });
    };

    return FruitSelector;
}

module.exports.requires = requires;
