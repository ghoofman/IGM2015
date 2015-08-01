var OP = require('OPengine').OP;

function Camera(limits) {

    this.vec3_0 = OP.vec3.Create(0,0,0);
    this.vec3_1 = OP.vec3.Create(0,0,0);
    this.vec3_0.Set(0, 20, 350);
  	this.camera = OP.camFreeFlight.Create(100.0, 3.0, this.vec3_0, 1.0, 2000.0);
    this.limits = limits || this.limits;
}

Camera.prototype = {
    vec3_0: null,
    vec3_1: null,
    camera: null,
    freeForm: false,
    limits: [ 0, 0, 150, 100, 0, 0 ],

    ToggleControl: function() {
      this.freeForm = !this.freeForm;
    },

    Update: function(timer) {
        if(!this.freeForm) return;
        this.camera.Update(timer);
    },

    LookAt: function(player) {
      if(this.freeForm) return;

      // We're not controlling the camera, so we're positioning
      // the camera to look at the player
      var target = [
        player.FootPos.x,
        player.FootPos.y + player.mesh.voxelData.size.y / 2.0,
        player.FootPos.z
      ];



    // Look At
    this.vec3_1.Set(target[0], target[1] + this.limits[6], target[2]);

      if(target[0] < this.limits[0]) target[0] = this.limits[0];
      if(target[0] > this.limits[1]) target[0] = this.limits[1];

      if(target[2] < this.limits[4]) target[2] = this.limits[4];
      if(target[2] > this.limits[5]) target[2] = this.limits[5];

      // Camera Position
      this.vec3_0.Set(target[0], target[1] + this.limits[2], target[2] + this.limits[3]);

      this.camera.Camera.SetPos(this.vec3_0);
      this.camera.Camera.SetTarget(this.vec3_1);
      this.camera.Camera.UpdateView();
    },

    Camera: function() {
        return this.camera.Camera;
    }
};

module.exports = Camera;
