'use strict';

var loader;
var ground, mesh;
var GLTF2Loader = require('../loaders/GLTF2Loader');

function Ground () {
  THREE.Object3D.call(this);
  this.addModel();
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addModel = function () {
  loader = new THREE.GLTF2Loader();
  var self = this;
  loader.load( 'models/ground/ground.gltf', function(data) {

    mesh = data.scene.children[0].children[0];
    mesh.material.color = new THREE.Color(0xffffff);
    ground = data.scene.children[0];
    self.add(ground);
  });
};

module.exports = Ground;
