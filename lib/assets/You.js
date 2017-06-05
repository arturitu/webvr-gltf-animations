'use strict';

const DaydreamController = require ('./DaydreamController');
const Hand = require ('./HandLocal');
const Head = require ('./HeadLocal');
const Expressions = require ('./Expressions');

let idController;
let activeHand = 'right';
let controller, expressions;

const controlPanelContainer = new THREE.Group();
const youContainer = new THREE.Group();
const youFlippedContainer = new THREE.Group();

function You (app) {
  THREE.Object3D.call(this);
  this.app = app;
  this.add(controlPanelContainer);
  controlPanelContainer.scale.multiplyScalar (0.25);
  // controlPanelContainer.rotation.x = -Math.PI/4;
  controlPanelContainer.position.set(0,this.app.controls.userHeight -0.4,-1.4);
  controlPanelContainer.rotation.y = Math.PI;
  this.head = new Head(app);
  youContainer.rotation.x = Math.PI/6;
  youContainer.add(this.head);
  controlPanelContainer.add(youContainer);
  youFlippedContainer.scale.x = -1;
  controlPanelContainer.add(youFlippedContainer);

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
        case "Gear VR Controller":
          //TODO custom mesh for Gear VR controller
          controller = new DaydreamController(this.app);
          this.app.scene.add(controller);
          activeHand = this.app.rayInput.controller.gamepad.hand;
          this.isLeftHanded = false;
          if(activeHand === 'left'){
              this.isLeftHanded = true;
          }
          this.handR = new Hand(this.app, false, this.isLeftHanded);
          this.handL = new Hand(this.app, true, this.isLeftHanded);
          if(this.isLeftHanded){
            youFlippedContainer.add(this.handL);
          }else{
            youFlippedContainer.add(this.handR);
          }
          break;
      }
    }else{
      if(this.app.rayInput.controller.gamepad.hand && this.app.rayInput.controller.gamepad.hand !== activeHand){
        this.changeHand();
      }
    }
    if(controller){
      controller.visible = true;
      if(this.isLeftHanded){
        this.handL.visible = true;
        this.handR.visible = false;
      }else{
        this.handR.visible = true;
        this.handL.visible = false;
      }
    }
  }else{
    if(controller){
      controller.visible = false;
      this.handL.visible = false;
      this.handR.visible = false;
    }
  }
}

You.prototype.changeHand = function (){
  console.log('changeHand', activeHand);
  // Change hand model to righthanded
  if(this.isLeftHanded){
    youFlippedContainer.remove(this.handL);
    youFlippedContainer.add(this.handR);
    this.handL.isLeftHanded = false;
    this.handR.isLeftHanded = false;
  }else{
  // Change hand model to lefthanded
    youFlippedContainer.remove(this.handR);
    youFlippedContainer.add(this.handL);
    this.handL.isLeftHanded = true;
    this.handR.isLeftHanded = true;
  }
  activeHand = this.app.rayInput.controller.gamepad.hand;
}

You.prototype.update = function (dt, time) {
  this.head.update(dt, time);
  this.checkGamepad();
  if(controller && controller.visible){
    controller.update(dt, time);
  }
  if(this.handR && this.handL){
    if(this.handR.visible){
      this.handR.update(dt, time);
    }
    if(this.handL.visible){
      this.handL.update(dt, time);
    }
  }
}

module.exports = You;
