'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var State = require('../../state/State');

var selfLoaded;

function Hair (mesh) {
  THREE.SkinnedMesh.call(this, mesh.geometry, mesh.material);
  this.hairChanged("curly");
}

Hair.prototype = Object.create(THREE.SkinnedMesh.prototype);

Hair.prototype.load = function (url) {
  var loader = new THREE.ObjectLoader();
  var self = this;
  loader.load(url, function (loadedObject) {
    for ( var i = 0; i < loadedObject.children.length; ++i) {
      loadedObject.children[i].material.skinning = true;
      loadedObject.children[i].material.morphTargets = true;
    }
    selfLoaded = loadedObject.children[0];
    var animations = self.geometry.animations;
    var bones = self.geometry.bones;

    var skinIndicesTmp = [];
    var skinWeightsTmp = [];
    for (var i = 0; i < selfLoaded.geometry.vertices.length; i++) {
      skinIndicesTmp.push(new THREE.Vector4(0, 11, 0, 0));
      skinWeightsTmp.push(new THREE.Vector4(0, 1, 0, 0));
    }

    self.geometry = selfLoaded.geometry;
    self.geometry.animations = animations;
    self.geometry.bones = bones;
    self.geometry.skinIndices = skinIndicesTmp;
    self.geometry.skinWeights = skinWeightsTmp;
    self.material = selfLoaded.material;

    self.hairColorChanged("#c3773f");
    Events.emit('hairLoaded');
  });
};

Hair.prototype.hairChanged = function (value) {
  var url = 'models/hair/' + value + '.json';
  if (value === 'none') {
    url = 'models/' + value + '.json';
  }
  this.load(url);
};

Hair.prototype.hairColorChanged = function (colorValue) {
  colorValue = colorValue.replace('#', '0x');
  this.material.color = new THREE.Color(parseInt(colorValue, 16));
};

module.exports = Hair;
