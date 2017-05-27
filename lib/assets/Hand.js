'use strict';

var TWEEN = require('tween.js');

var rayInput, pose, gamepad;
var loader;
var hand, mesh, touched;

var isLeftHanded = false;
var GLTF2Loader = require('../loaders/GLTF2Loader');

function Hand (ray) {
  THREE.Object3D.call(this);
  rayInput = ray;
  pose = rayInput.armModel.pose;
  this.addHand();
}

Hand.prototype = Object.create(THREE.Object3D.prototype);

Hand.prototype.addHand = function () {
  loader = new THREE.GLTF2Loader();
  var self = this;
  loader.load( 'models/hand/hand-bevel.gltf', function(data) {

    mesh = data.scene.children[0].children[0];
    mesh.material.color = new THREE.Color(0xffffff);
    hand = data.scene.children[0];
    self.add(hand);
    // mesh.morphTargetInfluences[0] = 1;
  });
};

Hand.prototype.update = function (dt, time) {
  gamepad = rayInput.controller.gamepad;
  // TODO implement for HTC Vive / Oculus controllers
  this.visible = gamepad;
  if(gamepad){
    if(gamepad.hand === 'left'){
      isLeftHanded = true;
      // Because is mirrored
      hand.rotation.y = 0;
    }else{
      isLeftHanded = false;
      // Because is mirrored
      hand.rotation.y = Math.PI;
    }
  // this.quaternion.copy(pose.orientation);
  this.quaternion.set( pose.orientation.x, -pose.orientation.y, -pose.orientation.z, pose.orientation.w );
  this.position.set(-pose.position.x,pose.position.y,pose.position.z - 0.3);

    touched = gamepad.buttons[0].touched;
    TWEEN.remove(this.tweenHand);
    if(gamepad.buttons[0].touched){
      if(gamepad.buttons[0].pressed){
        mesh.morphTargetInfluences[0] = 1;
      }else{
        mesh.morphTargetInfluences[1] = 1;
      }
    }else{
      mesh.morphTargetInfluences[0] = 0;
      mesh.morphTargetInfluences[1] = 0;
    }
  }else{

  }
};
module.exports = Hand;
