var OP = require('OPengine').OP;

function OptionSelector(text, options) {
  this.text = text;
  this.options = options;
}

OptionSelector.prototype = {
  text: '',
  options: [],
  selected: 0,

  Update: function(gamepad) {
      if(OP.keyboard.WasPressed(OP.KEY.W) || gamepad.WasPressed(OP.gamePad.DPAD_UP)) {
          this.selected--;
          if(this.selected < 0) this.selected = this.options.length - 1;
      }
      if(OP.keyboard.WasPressed(OP.KEY.S) || gamepad.WasPressed(OP.gamePad.DPAD_DOWN)) {
          this.selected++;
      }
      this.selected = this.selected % this.options.length;
      if(OP.keyboard.WasPressed(OP.KEY.ENTER) || OP.keyboard.WasPressed(OP.KEY.E) || gamepad.WasPressed(OP.gamePad.Y)) {
          this.options[this.selected].select && this.options[this.selected].select();
      }
  },

  Render: function(fontManager) {
      fontManager.SetAlign(OP.FONTALIGN.LEFT);
    	OP.fontRender.Begin(fontManager);
    	OP.fontRender(this.text, 50, 150);
      for(var i = 0; i < this.options.length; i++) {
        if(this.selected == i) {
      		OP.fontRender.Color(0.5,1.0,0.5);
        } else {
      		OP.fontRender.Color(1,1,1);
        }
    		OP.fontRender(this.options[i].text, 100, 200 + i * 50);
      }
    	OP.fontRender.End();
  }
};

module.exports = OptionSelector;
