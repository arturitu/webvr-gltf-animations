'use strict';

function Ground () {
  THREE.Object3D.call(this);
  this.addGround();
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addGround = function () {
  var textureLoader = new THREE.TextureLoader();
  var self = this;
  textureLoader.load('models/ground.png', function (texture) {
    var geometry = new THREE.PlaneBufferGeometry(2, 2);
    geometry.rotateX(-Math.PI / 2);
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    var ground = new THREE.Mesh(geometry, material);
    self.add(ground);
  });
};

module.exports = Ground;
