'use strict';

var TWEEN = require('tween.js');
var GLTF2Loader = require('../loaders/GLTF2Loader');

var totalExpressions = 6;

function Head (app) {
  THREE.Object3D.call(this);
  this.app = app;

  this.loader;
  this.idExpression = 0;
  this.tweenArr = [];

  this.body;

  this.isBlinking = false;
  this.talkInterval;
  this.lookVec3;

  this.speakVolume = 0;

  this.breathScale = 1;

  var self = this;

  this.loader = new THREE.GLTF2Loader();

  this.loader.load( 'models/emoji/emoji-4b-seam.gltf', function(data) {
    self.body = data.scene.children[0].children[0];
    self.body.material.color = new THREE.Color(0xffffff);
    self.add(data.scene.children[0]);
    setInterval(function () { self.blink(); }, 3500);
  });

  this.app.emitter.on('expressionDispatched', this.expressionDispatched.bind(this));

}

Head.prototype = Object.create(THREE.Object3D.prototype);

Head.prototype.expressionDispatched = function (id,active) {
  var self = this;
  // console.log(id,active);
  this.idExpression = id + 6;
  TWEEN.remove(tweenArr[id]);
  if(active){
    this.tweenArr[id] = new TWEEN.Tween({
      value:body.morphTargetInfluences[this.idExpression],
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
      value:body.morphTargetInfluences[this.idExpression],
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

Head.prototype.updateExpression = function (value, activeExpression) {
  this.body.morphTargetInfluences[activeExpression] = value;
};

Head.prototype.blink = function () {
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
      self.body.morphTargetInfluences[4] = self.blinkPosition;
    })
    .onComplete(function(){
      self.isBlinking = false;
    })
    .start();
};

Head.prototype.update = function (delta, time) {
  if(!this.lookVec3){
    return;
  }
  this.rotation.set(this.lookVec3.x,-this.lookVec3.y,-this.lookVec3.z);

  this.breathScale = 1 + (Math.sin(time*0.003)+ 1)/48;
  this.scale.set(this.breathScale,this.breathScale,this.breathScale);
  if(this.body){
    if(this.lookVec3.x>0){
      this.body.morphTargetInfluences[2] = THREE.Math.clamp(this.lookVec3.x*3,0,1);
    }else{
      this.body.morphTargetInfluences[3] = -THREE.Math.clamp(this.lookVec3.x*3,-1,0);
    }
    if(this.lookVec3.y>0){
      this.body.morphTargetInfluences[1] = -THREE.Math.clamp(this.lookVec3.y*6,0,1);
    }else{
      this.body.morphTargetInfluences[0] = THREE.Math.clamp(this.lookVec3.y*6,-1,0);
    }
    if(!this.getIsActing()){
      this.body.morphTargetInfluences[5] = 0.9 - this.speakVolume;
    }else{
      this.body.morphTargetInfluences[5] = 0;
    }
  }
};

Head.prototype.getIsActing = function () {
  var sumExpressions = 0;
  for (var i = 0; i < totalExpressions; i++) {
    sumExpressions +=  this.body.morphTargetInfluences[i+6];
  }
  if(sumExpressions>0){
    return true;
  }else{
    return false;
  }
}

module.exports = Head;
