'use strict';

var glslify = require('glslify');

function Sky () {
  THREE.Object3D.call(this);

  var geometry = new THREE.SphereBufferGeometry(500, 64, 64);
  var material = new THREE.ShaderMaterial(
    {
      uniforms: {
        colorTop: { type: 'c', value: new THREE.Color(0xe4e6ec) },
        colorBottom: { type: 'c', value: new THREE.Color(0xdbedf8) }
      },
      vertexShader: glslify('../shaders/sky.vert'),
      fragmentShader: glslify('../shaders/sky.frag'),
      side: THREE.BackSide
    }
  );

  this.mesh = new THREE.Mesh(geometry,material);
  this.add(this.mesh);
}

Sky.prototype = Object.create(THREE.Object3D.prototype);


module.exports = Sky;
