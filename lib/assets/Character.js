'use strict';

var TWEEN = require('tween.js');
var Body = require('./Body');
var GLTF2Loader = require('../loaders/GLTF2Loader');

var body, loader;
var actionBody = {}, mixerBody;

var isTalking = false;
var talkInterval;

function Character () {
  THREE.Object3D.call(this);
  var self = this;

  loader = new THREE.GLTF2Loader();

  loader.load( 'models/SimpleBox.gltf', function(data) {
    var simpleBox = data.scenes[0].children[0].children[0];
    // simpleBox.morphTargetInfluences[0] = 1;
    self.add(simpleBox);
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
    // console.log(body.morphTargetInfluences);

    // body.morphTargetInfluences[1] = 1;
  });
};

Character.prototype.blink = function () {
  this.blinkPosition = 0;
  var self = this;
  new TWEEN.Tween(this).to({
    blinkPosition: 1
  }, 90)
    .easing(TWEEN.Easing.Cubic.Out)
    .yoyo(true)
    .delay(25)
    .repeat(1)
    .onUpdate(function () {
      body.morphTargetInfluences[0] = self.blinkPosition;
    })
    .start();
};

Character.prototype.talk = function () {
  this.talkPosition = 1;
  var self = this;
  new TWEEN.Tween(this).to({
    talkPosition: 0
  }, 65)
    .easing(TWEEN.Easing.Cubic.Out)
    .yoyo(true)
    .delay(20)
    .repeat(1)
    .onUpdate(function () {
      body.morphTargetInfluences[1] = self.talkPosition;
    })
    .start();
};

Character.prototype.breath = function () {
  this.breathPosition = 0;
  var self = this;
  new TWEEN.Tween(this).to({
    breathPosition: 1
  }, 2000)
    .easing(TWEEN.Easing.Cubic.Out)
    .yoyo(true)
    .delay(100)
    .repeat(1)
    .onUpdate(function () {
      body.morphTargetInfluences[2] = self.breathPosition;
    })
    .start();
};

Character.prototype.characterChanged = function (params) {
  this.morphChanged(params);
  this.talkingChanged(params.talking);
};

Character.prototype.morphChanged = function (params) {
  // body.morphTargetInfluences[3] = params.arms;
  // body.morphTargetInfluences[4] = params.abdomen;
  // body.morphTargetInfluences[5] = params.legs;
};

Character.prototype.talkingChanged = function (bool) {
  if (bool && ! isTalking) {
    var self = this;
    talkInterval = setInterval(function () { self.talk(); }, 300);
    isTalking = true;
  }else {
    if (talkInterval) {
      clearInterval(talkInterval);
      isTalking = false;
    }
  }
};

Character.prototype.update = function (delta, time) {

};

module.exports = Character;
