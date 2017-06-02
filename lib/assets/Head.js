'use strict';

var GLTF2Loader = require('../loaders/GLTF2Loader');

function Head (app) {
  THREE.Object3D.call(this);
  this.app = app;

  this.loader;
  this.idExpression = 0;
  this.totalExpressions = 6;

  this.mesh;
  this.breathScale = 1;

  var self = this;

  this.loader = new THREE.GLTF2Loader();

  this.loader.load( 'models/emoji/emoji-4b-seam.gltf', function(data) {
    self.rotation.x = Math.PI/2;
    self.mesh = data.scene.children[0].children[0];
    self.mesh = data.scene.children[0].children[0];
    self.mesh.material.color = new THREE.Color(0xffffff);
    self.modelLoaded(self.mesh);
  });
}

Head.prototype = Object.create(THREE.Object3D.prototype);

Head.prototype.modelLoaded = function(obj){
  this.add(obj);
}

Head.prototype.update = function (delta, time) {
  this.breathScale = 1 + (Math.sin(time*0.003)+ 1)/48;
  this.scale.set(this.breathScale,this.breathScale,this.breathScale);
};

module.exports = Head;
