'use strict';

const DaydreamController = require ('./DaydreamController');
const Hand = require ('./Hand');
const Head = require ('./HeadLocal');
const Expressions = require ('./Expressions');

let idController;
let controller, expressions;

const controlPanelContainer = new THREE.Group();
const headContainer = new THREE.Group();

function You (app) {
  THREE.Object3D.call(this);
  this.app = app;
  this.add(controlPanelContainer);
  controlPanelContainer.scale.multiplyScalar (0.25);
  // controlPanelContainer.rotation.x = -Math.PI/4;
  controlPanelContainer.position.set(0,this.app.controls.userHeight -0.4,-1.4);
  controlPanelContainer.rotation.y = Math.PI;
  this.head = new Head(app);
  headContainer.rotation.x = Math.PI/6;
  headContainer.add(this.head);
  controlPanelContainer.add(headContainer);

  expressions = new Expressions(this.app);
  expressions.rotation.y = Math.PI;
  controlPanelContainer.add(expressions);
}

You.prototype = Object.create(THREE.Object3D.prototype);

You.prototype.checkGamepad = function () {
  if(this.app.rayInput.controller.gamepad){
    if(this.app.rayInput.controller.gamepad.id !== idController){
      idController = this.app.rayInput.controller.gamepad.id;
      // console.log(idController);
      switch (idController) {
        case "Daydream Controller":
          controller = new DaydreamController(this.app);
          this.app.scene.add(controller);
          break;
        case "Gear VR Controller":
          console.log('TODO custom mesh for Gear VR controller');
          controller = new DaydreamController(this.app);
          this.app.scene.add(controller);
          break;
      }
    }
    if(controller){
      controller.visible = true;
    }
  }else{
    if(controller){
      controller.visible = false;
    }
  }
}

You.prototype.update = function (dt, time) {
  this.head.update(dt, time);
  this.checkGamepad();
  if(controller && controller.visible){
    controller.update(dt, time);
  }
}

module.exports = You;
