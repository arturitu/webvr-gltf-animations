'use strict';

var MirrorTHREE = require('../utils/Mirror');

function Mirror () {
  THREE.Object3D.call(this);
  this.init();
}

Mirror.prototype = Object.create(THREE.Object3D.prototype);

Mirror.prototype.init = function () {
  var mirror = new THREE.Mirror(3, 3, { clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color: 0x777777 });
  mirror.position.set(0,2,0);
  this.add(mirror);
};

module.exports = Mirror;
