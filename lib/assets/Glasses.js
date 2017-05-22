'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var State = require('../../state/State');

var hairMeshLoaded;

function Glasses (mesh) {
  THREE.SkinnedMesh.call(this, mesh.geometry, mesh.material);
  Events.on('glassesChanged', this.glassesChanged.bind(this));
  Events.on('glassesColorChanged', this.glassesColorChanged.bind(this));
}

Glasses.prototype = Object.create(THREE.SkinnedMesh.prototype);

Glasses.prototype.load = function (url) {
  var loader = new THREE.ObjectLoader();
  var self = this;
  loader.load(url, function (loadedObject) {
    for ( var i = 0; i < loadedObject.children.length; ++i) {
      loadedObject.children[i].material.skinning = true;
      loadedObject.children[i].material.morphTargets = true;
    }
    hairMeshLoaded = loadedObject.children[0];
    var animations = self.geometry.animations;
    var bones = self.geometry.bones;

    var skinIndicesTmp = [];
    var skinWeightsTmp = [];
    for (var i = 0; i < hairMeshLoaded.geometry.vertices.length; i++) {
      skinIndicesTmp.push(new THREE.Vector4(0, 11, 0, 0));
      skinWeightsTmp.push(new THREE.Vector4(0, 1, 0, 0));
    }

    self.geometry = hairMeshLoaded.geometry;
    self.geometry.animations = animations;
    self.geometry.bones = bones;
    self.geometry.skinIndices = skinIndicesTmp;
    self.geometry.skinWeights = skinWeightsTmp;
    self.material = hairMeshLoaded.material;
    Events.emit('glassesLoaded');
  });
};

Glasses.prototype.glassesChanged = function (value) {
  var url = 'models/glasses/' + value + '.json';
  if (value === 'none') {
    url = 'models/' + value + '.json';
  }
  this.load(url);
};

Glasses.prototype.glassesColorChanged = function (colorValue) {
  colorValue = colorValue.replace('#', '0x');
  this.material.color = new THREE.Color(parseInt(colorValue, 16));
};

module.exports = Glasses;
