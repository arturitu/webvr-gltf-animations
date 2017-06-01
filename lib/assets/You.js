'use strict';

function You (app) {
  THREE.Object3D.call(this);
  this.app = app;
}

You.prototype = Object.create(THREE.Object3D.prototype);

You.prototype.update = function (dt, time) {

}

module.exports = You;
