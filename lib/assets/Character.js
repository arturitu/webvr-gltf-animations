'use strict';

var TWEEN = require('tween.js');
var GLTF2Loader = require('../loaders/GLTF2Loader');

var loader;
var idExpression = 0;
var totalExpressions = 6;
var tweenArr = [];

var body;

var isBlinking = false;
var talkInterval;
var lookVec3 = new THREE.Vector3();

var breathScale = 1;

function Character (app) {
  THREE.Object3D.call(this);
  this.app = app;
  var self = this;

  loader = new THREE.GLTF2Loader();

  loader.load( 'models/emoji/emoji-4b-seam.gltf', function(data) {
    body = data.scene.children[0].children[0];
    body.material.color = new THREE.Color(0xffffff);
    self.body = body;
    self.add(data.scene.children[0]);
    setInterval(function () { self.blink(); }, 3500);
  });

  this.app.emitter.on('expressionDispatched', this.expressionDispatched.bind(this));

}

Character.prototype = Object.create(THREE.Object3D.prototype);

Character.prototype.expressionDispatched = function (id,active) {
  var self = this;
  // console.log(id,active);
  idExpression = id + 6;
  TWEEN.remove(tweenArr[id]);
  if(active){
    tweenArr[id] = new TWEEN.Tween({
      value:body.morphTargetInfluences[idExpression],
      idEx: idExpression
    })
    .to({ value: 1 }, 400)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      self.updateExpression(this.value, this.idEx);
    })
    .start();
  }else{
    tweenArr[id] = new TWEEN.Tween({
      value:body.morphTargetInfluences[idExpression],
      idEx:idExpression
    })
    .to({ value: 0 }, 300)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      self.updateExpression(this.value, this.idEx);
    })
    .start();
  }
}

Character.prototype.updateExpression = function (value, activeExpression) {
  body.morphTargetInfluences[activeExpression] = value;
};

Character.prototype.blink = function () {
  this.blinkPosition = 0;
  var self = this;
  isBlinking = true;
  new TWEEN.Tween(this).to({
    blinkPosition: 1
  }, 90)
    .easing(TWEEN.Easing.Cubic.Out)
    .yoyo(true)
    .delay(25)
    .repeat(1)
    .onUpdate(function () {
      body.morphTargetInfluences[4] = self.blinkPosition;
    })
    .onComplete(function(){
      isBlinking = false;
    })
    .start();
};

Character.prototype.update = function (delta, time) {
  lookVec3 = this.app.camera.rotation;
  this.rotation.set(lookVec3.x,-lookVec3.y,-lookVec3.z);

  breathScale = 1 + (Math.sin(time*0.003)+ 1)/48;
  this.scale.set(breathScale,breathScale,breathScale);
  if(body){
    if(lookVec3.x>0){
      body.morphTargetInfluences[2] = THREE.Math.clamp(lookVec3.x*3,0,1);
    }else{
      body.morphTargetInfluences[3] = -THREE.Math.clamp(lookVec3.x*3,-1,0);
    }
    if(lookVec3.y>0){
      body.morphTargetInfluences[1] = -THREE.Math.clamp(lookVec3.y*6,0,1);
    }else{
      body.morphTargetInfluences[0] = THREE.Math.clamp(lookVec3.y*6,-1,0);
    }
    if(!this.getIsActing()){
      body.morphTargetInfluences[5] = 0.9 - this.app.speak.volume;
    }else{
      body.morphTargetInfluences[5] = 0;
    }
  }
};

Character.prototype.getIsActing = function () {
  var sumExpressions = 0;
  for (var i = 0; i < totalExpressions; i++) {
    sumExpressions +=  body.morphTargetInfluences[i+6];
  }
  if(sumExpressions>0){
    return true;
  }else{
    return false;
  }
}

module.exports = Character;
