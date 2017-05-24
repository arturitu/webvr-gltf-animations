'use strict';

function Body (mesh) {
  mesh.material.skinning = true;
  mesh.material.morphTargets = true;
  console.log(mesh);
  THREE.Mesh.call(this, mesh.geometry, mesh.material);
}

Body.prototype = Object.create(THREE.Mesh.prototype);

// Body.prototype.loadTexture = function (url) {
//   var loader = new THREE.TextureLoader();
//   var self = this;
//   loader.load(url, function (texture) {
//     self.material.map = texture;
//     Events.emit('BodyLoaded');
//   });
// };

// Body.prototype.bodyChanged = function (value) {
//   var url = 'models/' + value + '-texture.png';
//   this.loadTexture(url);
// };

module.exports = Body;
