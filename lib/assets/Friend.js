'use strict';

const Hand = require ('./Hand');
const Head = require ('./Head');

const container = new THREE.Group();

function Friend (app) {
  THREE.Object3D.call(this);
  this.name = 'friend';
  this.app = app;

  container.position.set(0,this.app.controls.userHeight,-3);
  container.rotation.y = Math.PI;
  this.add(container);

  this.head = new Head(app);
  container.add(this.head);
}

Friend.prototype = Object.create(THREE.Object3D.prototype);

Friend.prototype.update = function (dt, time) {
  this.head.update(dt, time);
}

module.exports = Friend;
