'use strict';

var TWEEN = require('tween.js');
var Body = require('./Body');
var GLTF2Loader = require('../loaders/GLTF2Loader');

var BufferSubdivisionModifier = require('../modifiers/BufferSubdivisionModifier');

var loader;
var body, mixerBody;
var actionBody = {}, mixerBody;

var isBlinking = false;
var isTalking = false;
var talkInterval;
var lookVec3 = new THREE.Vector3();

function Character (app) {
  THREE.Object3D.call(this);
  this.app = app;
  var self = this;

  loader = new THREE.GLTF2Loader();
  var modifier = new THREE.BufferSubdivisionModifier( 3 );

  // loader.load( 'models/monster/monster.gltf', function(data) {
  // loader.load( 'models/riggedBox.gltf', function(data) {
    loader.load( 'models/emoji/emoji-4b-seam.gltf', function(data) {
    body = data.scene.children[0].children[0];
    body.material.color = new THREE.Color(0xffffff);
    body.rotation.x = Math.PI;
    body.rotation.y = Math.PI;
    self.add(data.scene.children[0]);
    var test = body.morphTargetInfluences[3];
    // console.log(body.morphTargetInfluences);
    setInterval(function () { self.blink(); }, 3500);
    self.talkingChanged(true);
    // console.log(body.geometry.clone());
    // var geom = new THREE.BoxBufferGeometry();
    // var smooth = modifier.modify(geom);
    // console.log(smooth);
    // mixerBody = new THREE.AnimationMixer(data.scenes[0].children[0]);
    // var animations = data.animations;
    // // for ( var i = 0; i < animations.length; i ++ ) {
    //   var animation = animations[ 0 ];
    //   mixerBody.clipAction( animation ).play();
    // // }
    // self.add(body);
  });

}

Character.prototype = Object.create(THREE.Object3D.prototype);

Character.prototype.addCharacter = function () {
  var loader = new THREE.ObjectLoader();
  var self = this;
  loader.load('models/head.json', function (loadedObject) {
    for ( var i = 0; i < loadedObject.children.length; ++i) {
      loadedObject.children[i].material.skinning = true;
      loadedObject.children[i].material.morphTargets = true;
    }
    body = new Body(loadedObject.children[1]);
    self.add(body);
    console.log(body.morphTargetInfluences);

    body.morphTargetInfluences[0] = 1;
  });
};

Character.prototype.blink = function () {
  this.blinkPosition = 0;
  var self = this;
  isBlinking = true;
  // body.morphTargetInfluences[0] = 0;
  // body.morphTargetInfluences[1] = 0;
  // body.morphTargetInfluences[2] = 0;
  // body.morphTargetInfluences[3] = 0;
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

Character.prototype.talk = function () {
  this.talkPosition = 1;
  var self = this;
  new TWEEN.Tween(this).to({
    talkPosition: 0
  }, 305)
    .easing(TWEEN.Easing.Cubic.Out)
    .yoyo(true)
    .delay(20)
    .repeat(1)
    .onUpdate(function () {
      body.morphTargetInfluences[5] = self.talkPosition;
    })
    .start();
};

Character.prototype.morphChanged = function (params) {
  // body.morphTargetInfluences[3] = params.arms;
  // body.morphTargetInfluences[4] = params.abdomen;
  // body.morphTargetInfluences[5] = params.legs;
};

Character.prototype.talkingChanged = function (bool) {
  if (bool && ! isTalking) {
    var self = this;
    talkInterval = setInterval(function () { self.talk(); }, 600);
    isTalking = true;
  }else {
    if (talkInterval) {
      clearInterval(talkInterval);
      isTalking = false;
    }
  }
};

Character.prototype.update = function (delta, time) {
  lookVec3 = this.app.camera.rotation;
  this.rotation.set(-lookVec3.x,-lookVec3.y,lookVec3.z);
  if(body){
    if(lookVec3.x>0){
      body.morphTargetInfluences[2] = THREE.Math.clamp(lookVec3.x*3,0,1);
    }else{
      body.morphTargetInfluences[3] = -THREE.Math.clamp(lookVec3.x*3,-1,0);
    }
    if(lookVec3.y>0){
      body.morphTargetInfluences[0] = THREE.Math.clamp(lookVec3.y*3,0,1);
    }else{
      body.morphTargetInfluences[1] = -THREE.Math.clamp(lookVec3.y*3,-1,0);
    }
  }
};

module.exports = Character;
