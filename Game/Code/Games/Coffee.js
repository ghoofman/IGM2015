var OP = require('OPengine').OP;

function Coffee() {

};

Coffee.prototype = {


    Update: function(timer, gamepad) {
        if(OP.keyboard.WasPressed(OP.KEY.E)) {
            return 1;
        }

        return 0;
    },

    Draw: function() {
      OP.render.Clear(0,0,0);
    },

    Exit: function() {

    }
};

module.exports = Coffee;
