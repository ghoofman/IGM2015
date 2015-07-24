function Progress() {
  this.background = OP.texture2D.Create(OP.cman.LoadGet('FadedBackground.png'));
  this.background.Scale.Set(2, 2);
}

Progress.prototype = {

	Update: function(timer) {
		return 0;
	},

	Draw: function() {
		OP.texture2D.Render(this.background);
	}

};

module.exports = Progress;
