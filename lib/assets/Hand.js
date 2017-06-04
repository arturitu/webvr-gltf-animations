'use strict';

const TWEEN = require('tween.js');

const GLTF2Loader = require('../loaders/GLTF2Loader');

function Hand (app) {
  THREE.Object3D.call(this);
  this.app = app;

  this.gamepad;

  this.mesh;

  this.isLeftHanded = false;

  this.loader = new THREE.GLTF2Loader();
  let self = this;
  this.loader.load( 'models/hand/hand-bevel.gltf', function(data) {
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
  // TODO implement for HTC Vive / Oculus controllers
  if(this.gamepad && this.mesh){
    if(this.gamepad.hand === 'left'){
      this.isLeftHanded = true;
      // Because is mirrored
      this.mesh.rotation.z = 0;
    }else{
      this.isLeftHanded = false;
      // Because is mirrored
      // this.mesh.rotation.z = -Math.PI;
    }
  }else{

  }
};
module.exports = Hand;
