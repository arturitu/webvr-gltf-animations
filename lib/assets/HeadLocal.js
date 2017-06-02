'use strict';

const Head = require('./Head');
var TWEEN = require('tween.js');

function HeadLocal (app) {
  Head.call(this, app);
  this.tweenArr = [];

  this.isBlinking = false;
  this.lookVec3 = this.app.camera.rotation;

  this.app.emitter.on('expressionDispatched', this.expressionDispatched.bind(this));

}

HeadLocal.prototype = Object.create(Head.prototype);

HeadLocal.prototype.modelLoaded = function(obj){
  Head.prototype.modelLoaded.call( this, obj );
  this.app.emitter.emit('headLoaded', obj);
}
HeadLocal.prototype.expressionDispatched = function (id,active) {
  var self = this;
  // console.log(id,active);
  this.idExpression = id + 6;
  TWEEN.remove(this.tweenArr[id]);
  if(active){
    this.tweenArr[id] = new TWEEN.Tween({
      value:this.mesh.morphTargetInfluences[this.idExpression],
      idEx: this.idExpression
    })
    .to({ value: 1 }, 400)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      self.updateExpression(this.value, this.idEx);
    })
    .start();
  }else{
    this.tweenArr[id] = new TWEEN.Tween({
      value:this.mesh.morphTargetInfluences[this.idExpression],
      idEx:this.idExpression
    })
    .to({ value: 0 }, 300)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      self.updateExpression(this.value, this.idEx);
    })
    .start();
  }
}

HeadLocal.prototype.updateExpression = function (value, activeExpression) {
  this.mesh.morphTargetInfluences[activeExpression] = value;
};

HeadLocal.prototype.blink = function () {
  this.blinkPosition = 0;
  var self = this;
  this.isBlinking = true;
  new TWEEN.Tween(this).to({
    blinkPosition: 1
  }, 90)
    .easing(TWEEN.Easing.Cubic.Out)
    .yoyo(true)
    .delay(25)
    .repeat(1)
    .onUpdate(function () {
      self.mesh.morphTargetInfluences[4] = self.blinkPosition;
    })
    .onComplete(function(){
      self.isBlinking = false;
    })
    .start();
};

HeadLocal.prototype.update = function (delta, time) {
  Head.prototype.update.call( this, delta, time );
  this.speakVolume = this.app.speak.volume;

  if(this.mesh){
    this.mesh.rotation.set(this.lookVec3.x,-this.lookVec3.z,this.lookVec3.y);
    if(this.lookVec3.x>0){
      this.mesh.morphTargetInfluences[2] = THREE.Math.clamp(this.lookVec3.x*3,0,1);
    }else{
      this.mesh.morphTargetInfluences[3] = -THREE.Math.clamp(this.lookVec3.x*3,-1,0);
    }
    if(this.lookVec3.y>0){
      this.mesh.morphTargetInfluences[1] = -THREE.Math.clamp(this.lookVec3.y*6,0,1);
    }else{
      this.mesh.morphTargetInfluences[0] = THREE.Math.clamp(this.lookVec3.y*6,-1,0);
    }
    if(!this.getIsActing()){
      this.mesh.morphTargetInfluences[5] = 0.9 - this.speakVolume;
    }else{
      this.mesh.morphTargetInfluences[5] = 0;
    }
  }
};

HeadLocal.prototype.getIsActing = function () {
  var sumExpressions = 0;
  for (var i = 0; i < this.totalExpressions; i++) {
    sumExpressions +=  this.mesh.morphTargetInfluences[i+6];
  }
  if(sumExpressions>0){
    return true;
  }else{
    return false;
  }
}

module.exports = HeadLocal;
