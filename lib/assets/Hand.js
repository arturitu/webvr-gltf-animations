'use strict';

const TWEEN = require('tween.js');

const GLTF2Loader = require('../loaders/GLTF2Loader');

function Hand (app, isLeftHand) {
  THREE.Object3D.call(this);
  this.app = app;

  this.gamepad;

  this.mesh;

  this.isLeftHand = isLeftHand;
  let meshFile = 'hand-r-bevel.gltf';
  if(this.isLeftHand){
    meshFile = 'hand-l-bevel.gltf';
  }
  this.loader = new THREE.GLTF2Loader();
  let self = this;
  this.loader.load( 'models/hand/' + meshFile, function(data) {
    self.rotation.x = Math.PI/2;
    self.mesh = data.scene.children[0].children[0];
    self.mesh.material.color = new THREE.Color(0xffffff);
    self.modelLoaded(self.mesh);
  });
}

Hand.prototype = Object.create(THREE.Object3D.prototype);

Hand.prototype.modelLoaded = function(obj){
  this.add(obj);
}

Hand.prototype.update = function (dt, time) {
  this.gamepad = this.app.rayInput.controller.gamepad;
};
module.exports = Hand;
