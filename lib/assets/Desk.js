'use strict';

var loader;
var desk, mesh;
var GLTF2Loader = require('../loaders/GLTF2Loader');

function Desk () {
  THREE.Object3D.call(this);
  this.addModel();
}

Desk.prototype = Object.create(THREE.Object3D.prototype);

Desk.prototype.addModel = function () {
  loader = new THREE.GLTF2Loader();
  var self = this;
  loader.load( 'models/desk/desk.gltf', function(data) {
    mesh = data.scene.children[0].children[0];
    mesh.material.color = new THREE.Color(0xffffff);
    desk = data.scene.children[0];
    self.add(desk);
  });
};

module.exports = Desk;
