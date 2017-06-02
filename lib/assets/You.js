'use strict';

const DaydreamController = require ('./DaydreamController');
const Hand = require ('./Hand');
const Head = require ('./HeadLocal');
const Expressions = require ('./Expressions');

let ddController, hand, head, expressions;

const controlPanelContainer = new THREE.Group();

function You (app) {
  THREE.Object3D.call(this);
  this.app = app;
  this.add(controlPanelContainer);
  controlPanelContainer.scale.multiplyScalar (0.08);
  controlPanelContainer.rotation.x = -Math.PI/4;
  controlPanelContainer.position.set(0,this.app.controls.userHeight - 0.15,-0.4);
  controlPanelContainer.rotation.y = Math.PI;
  this.head = new Head(app);
  controlPanelContainer.add(this.head);


}

You.prototype = Object.create(THREE.Object3D.prototype);

You.prototype.update = function (dt, time) {
  this.head.update(dt, time);
}

module.exports = You;
