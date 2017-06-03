'use strict';

var GLTF2Loader = require('../loaders/GLTF2Loader');

var loader;
var controller;
var controllerMesh;

var rayInput;
var pose;
var gamepad;
var touchpadRadius = 0.05;
var touchpadContainer;
var circleTouchpad;
var touched, pressed;
var touchVec2 = new THREE.Vector2();

var mapIdle = new THREE.TextureLoader().load( "textures/ddcontroller_idle.png" );
mapIdle.wrapS = THREE.RepeatWrapping;
mapIdle.wrapT = THREE.RepeatWrapping;
mapIdle.flipY = false;
var mapTouch = new THREE.TextureLoader().load( "textures/ddcontroller_touchpad.png" );
mapTouch.wrapS = THREE.RepeatWrapping;
mapTouch.wrapT = THREE.RepeatWrapping;
mapTouch.flipY = false;

function DaydreamController (app) {
  THREE.Object3D.call(this);
  rayInput = app.rayInput;
  gamepad = app.rayInput.controller.gamepad;
  pose = rayInput.armModel.pose;
  this.addDaydreamController();
}

DaydreamController.prototype = Object.create(THREE.Object3D.prototype);

DaydreamController.prototype.addDaydreamController = function () {

  loader = new THREE.GLTF2Loader();
  var self = this;

  loader.load( 'models/dd-controller/dd-controller.gltf', function(data) {

    controllerMesh = data.scene.children[0].children[0];
    controllerMesh.material.color = new THREE.Color(0xffffff);
    controllerMesh.material.emissive = new THREE.Color(0xffffff);
    controllerMesh.material.emissiveIntensity = 0.1;

    controller = data.scene.children[0];
    self.add(controller);
  });


  touchpadContainer = new THREE.Group();
  touchpadContainer.position.y = 0.01;
  touchpadContainer.position.z = -0.1;
  touchpadContainer.rotation.x = -Math.PI/2;
  this.add(touchpadContainer);

  circleTouchpad = new THREE.Mesh( new THREE.CircleGeometry(touchpadRadius*0.1,6), new THREE.MeshBasicMaterial({
    color: 0x2979ff,
    side: THREE.DoubleSide,
    // depthTest: false,
    // depthWrite: false
  }) );
  touchpadContainer.add(circleTouchpad);
};

DaydreamController.prototype.update = function (dt, time) {
  if(controllerMesh){
    this.quaternion.set( pose.orientation.x, pose.orientation.y, pose.orientation.z, pose.orientation.w );
    this.position.set(pose.position.x,pose.position.y,pose.position.z);
    touched = gamepad.buttons[0].touched;
    if(gamepad.buttons[0].touched){
      circleTouchpad.visible = true;
      circleTouchpad.position.x = gamepad.axes[0]*touchpadRadius;
      circleTouchpad.position.y = - gamepad.axes[1]*touchpadRadius;
       if(gamepad.buttons[0].pressed){
          controllerMesh.material.map = mapTouch;
       }else{
          controllerMesh.material.map = mapIdle;
       }
    }else{
      controllerMesh.material.map = mapIdle;
      circleTouchpad.visible = false;
    }
    controllerMesh.material.needsUpdate = true;
  }
};
module.exports = DaydreamController;
