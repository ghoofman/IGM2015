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
    	OP.font.Render.Begin(fontManager);
    	OP.font.Render.Text(this.text, 50, 50);
      for(var i = 0; i < this.options.length; i++) {
        if(this.selected == i) {
      		OP.font.Render.Color(0.5,1.0,0.5);
        } else {
      		OP.font.Render.Color(1,1,1);
        }
    		OP.font.Render.Text(this.options[i].text, 100, 100 + i * 50);
      }
    	OP.font.Render.End();
  }
};

module.exports = OptionSelector;
