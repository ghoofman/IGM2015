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

    var GrainSelector = new BaseSelector('Fruit', 'CoffeeSelector', [
        {
            id : 1,
            name : 'Ramen $0.10',
            sprite: 'GROCERYRamen-iso',
            scale: [ 0.5, 0.5 ],
            actualName: 'Ramen',
            cost: 0.10,
            bites: 2,
            desc: [ 'Beige. Just beige.', '[ Fills 1 hunger ]', '2 bites remains' ]
        },
        {
            id : 2,
            name : 'Bread $1.50',
            sprite: 'GROCERYBread-iso',
            scale: [ 0.5, 0.5 ],
            actualName: 'Bread',
            cost: 1.50,
            bites: 5,
            desc: ['Epic starting point for a PB&J', '[ Fills 1 hunger ]', '5 bites remain']
        },
        {
            id : 3,
            name : 'Cereal $1.00',
            sprite: 'GROCERYCereal-iso',
            scale: [ 0.5, 0.5 ],
            actualName: 'Cereal',
            cost: 1.00,
            bites: 3,
            desc: [ 'My little O\'s. So good.', '[ Fills 1 hunger ]', '3 bites remain']
        }
    ]);

    GrainSelector.onExit = function() {
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

    GrainSelector.onSelected = function(id) {
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

    return GrainSelector;
}

module.exports.requires = requires;
