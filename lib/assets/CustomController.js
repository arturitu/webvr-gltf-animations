'use strict';

var rayInput;
var pose;
var gamepad;
var circleRadius = 0.1;
var circle, circleTouchpad;
var touched, pressed;
var touchVec2 = new THREE.Vector2();

function CustomController (ray) {
  THREE.Object3D.call(this);
  rayInput = ray;
  pose = rayInput.armModel.pose;
  this.addCustomController();
}

CustomController.prototype = Object.create(THREE.Object3D.prototype);

CustomController.prototype.addCustomController = function () {
  circle = new THREE.Mesh( new THREE.CircleGeometry(circleRadius,6), new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false
  }) );
  circle.position.y = circleRadius/2;
  circle.position.z = -0.15;
  circle.rotation.x = -Math.PI/2;
  this.add(circle);

  circleTouchpad = new THREE.Mesh( new THREE.CircleGeometry(circleRadius*0.1,6), new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false
  }) );
  circleTouchpad.position.y = 0.001;
  circle.add(circleTouchpad);
};

CustomController.prototype.update = function (dt, time) {
  gamepad = rayInput.controller.gamepad;
  // TODO implement for HTC Vive / Oculus controllers
  if(gamepad){
    this.quaternion.set( pose.orientation.x, pose.orientation.y, pose.orientation.z, pose.orientation.w );
    this.position.set(pose.position.x,pose.position.y,pose.position.z);

    touched = gamepad.buttons[0].touched;
    if(gamepad.buttons[0].touched){
      circleTouchpad.visible = true;
      circleTouchpad.position.x = gamepad.axes[0]*circleRadius;
      circleTouchpad.position.y = - gamepad.axes[1]*circleRadius;
      if(gamepad.buttons[0].pressed){
        circle.material.color = new THREE.Color(0x336699);
      }else{
        circle.material.color = new THREE.Color(0xffffff);
      }
    }else{
      circleTouchpad.visible = false;
    }
    // console.log(gamepad.axes);
    // console.log(gamepad.buttons[0]);
  }else{
    this.quaternion.set( 0,0,0,1 );
    this.position.set(0,1.28,-0.5);
    this.rotation.x = Math.PI/4;
    circleTouchpad.visible = false;
  }
};
module.exports = CustomController;
