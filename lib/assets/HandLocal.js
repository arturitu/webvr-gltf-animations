'use strict';

const Hand = require ('./Hand');
const TWEEN = require('tween.js');

const GLTF2Loader = require('../loaders/GLTF2Loader');

function HandLocal (app, isLeftHand, isLeftHanded) {
  // Opposite isLeftHand because hand mesh is mirrored at HandLocal
  Hand.call(this, app, !isLeftHand, isLeftHanded);
  this.touched;
  this.pose = this.app.rayInput.armModel.pose;
}

HandLocal.prototype = Object.create(Hand.prototype);


HandLocal.prototype.modelLoaded = function(obj){
  Hand.prototype.modelLoaded.call( this, obj );
  // Opposite isLeftHand because hand mesh is mirrored at HandLocal
  if(!this.isLeftHand){
    this.app.emitter.emit('handLAdded', this.mesh, this.isLeftHanded);
  }else{
    this.app.emitter.emit('handRAdded', this.mesh, this.isLeftHanded);
  }
}
HandLocal.prototype.update = function (dt, time) {
  Hand.prototype.update.call( this, dt, time );
  if(this.gamepad && this.mesh){
    this.quaternion.set( this.pose.orientation.x, -this.pose.orientation.y, -this.pose.orientation.z, this.pose.orientation.w );
    this.position.set(-this.pose.position.x,this.pose.position.y-this.app.controls.userHeight,this.pose.position.z-0.3);
    this.touched = this.gamepad.buttons[0].touched;
    TWEEN.remove(this.tweenHand);
    if(this.gamepad.buttons[0].touched){
      if(this.gamepad.buttons[0].pressed){
        this.mesh.morphTargetInfluences[0] = 1;
      }else{
        this.mesh.morphTargetInfluences[1] = 1;
      }
    }else{
      this.mesh.morphTargetInfluences[0] = 0;
      this.mesh.morphTargetInfluences[1] = 0;
    }
  }
};
module.exports = HandLocal;
