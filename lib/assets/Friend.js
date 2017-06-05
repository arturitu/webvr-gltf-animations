'use strict';

const Hand = require ('./Hand');
const Head = require ('./Head');

const container = new THREE.Group();

function Friend (app) {
  THREE.Object3D.call(this);
  this.name = 'friend';
  this.app = app;

  this.isLeftHanded = false;
  container.position.set(0,this.app.controls.userHeight,-3);
  container.rotation.y = Math.PI;
  this.add(container);

  this.head = new Head(app);
  container.add(this.head);

  this.handR = new Hand(this.app, false, this.isLeftHanded);
  container.add(this.handR);
  this.handL = new Hand(this.app, true, this.isLeftHanded);
  container.add(this.handL);
  this.handR.visible = false;
  this.handL.visible = false;
}

Friend.prototype = Object.create(THREE.Object3D.prototype);

Friend.prototype.setHanded = function (isLeftHanded) {
  this.isLeftHanded = isLeftHanded;
  this.handR.visible = !this.isLeftHanded;
  this.handL.visible = this.isLeftHanded;
}

Friend.prototype.update = function (dt, time) {
  this.head.update(dt, time);
  this.handR.update(dt, time);
  this.handL.update(dt, time);
}

module.exports = Friend;
