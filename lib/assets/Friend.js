'use strict';

function Friend (app) {
  THREE.Object3D.call(this);
  this.app = app;
}

Friend.prototype = Object.create(THREE.Object3D.prototype);

Friend.prototype.update = function (dt, time) {

}

module.exports = Friend;
