'use strict';

var ExpressionButtton = require('./ExpressionButtton');

var buttonsGroup = new THREE.Group();
var texture;
var totalExpressions = 6;
var buttonsArr = [];
var size = 0.5;
var breakUp = 0.1;

function Expressions (app) {
  this.app = app;
  THREE.Object3D.call(this);

  this.add(buttonsGroup);
  texture = new THREE.TextureLoader().load( "images/expressions-atlas.png", this.addButtons.bind(this) );
}
Expressions.prototype = Object.create(THREE.Object3D.prototype);

Expressions.prototype.addButtons = function (){
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 1/8, 1 );
  for (var i = 0; i < totalExpressions; i++) {
    var textureTmp = texture.clone();
    textureTmp.needsUpdate = true;

    var buttonTmp = new ExpressionButtton(this.app,textureTmp, i);
    buttonTmp.material.map.offset.x = 1/8 * i;
    buttonsGroup.add(buttonTmp);

    var angleTmp = THREE.Math.degToRad(-30 + (12*i));
    buttonTmp.position.x = Math.sin(angleTmp) * 2.8;
    buttonTmp.position.y = Math.cos(angleTmp) * 2.8;
    buttonTmp.rotation.z = -angleTmp;
    buttonsArr.push(buttonTmp);
  }
};

module.exports = Expressions;
