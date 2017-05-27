'use strict';

var TWEEN = require('tween.js');

function ExpressionButton (app, texture, index) {
  this.app = app;

  this.index = index;
  THREE.Mesh.call(this, new THREE.PlaneGeometry(0.4,0.4), new THREE.MeshBasicMaterial({
    transparent:true,
    opacity: 1,
    map: texture
  }));

  this.collider = new THREE.Mesh(new THREE.SphereGeometry(0.3,32), new THREE.MeshBasicMaterial({transparent:true,opacity:0, depthTest:false}));
  this.add(this.collider);
  this.app.rayInput.add(this);
}
ExpressionButton.prototype = Object.create(THREE.Mesh.prototype);

ExpressionButton.prototype.over = function(bool){
  this.newPosition = 0;
  // this.newOpacity = 0.5;
  if(bool){
    this.newPosition = 0.2;
    // this.newOpacity = 1;
    this.app.emitter.emit('expressionDispatched',this.index,bool);
  }else{
    this.app.emitter.emit('expressionDispatched',this.index,bool);
  }

  new TWEEN.Tween(this.position).to({
    z: this.newPosition
  }, 500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  // new TWEEN.Tween(this.material).to({
  //   opacity: this.newOpacity
  // }, 500)
  //   .easing(TWEEN.Easing.Cubic.Out)
  //   .start();
}

ExpressionButton.prototype.active = function(bool){
  if(bool){
    this.app.emitter.emit('expressionDispatched',this.index,bool);
  }
}

module.exports = ExpressionButton;
