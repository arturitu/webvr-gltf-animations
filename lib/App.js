'use strict';

import RayInput from './ray/ray-input';

var webvrui = require('webvr-ui');
var VREffect = require('./effects/VREffect');
var VRControls = require('./controls/VRControls');

var TWEEN = require('tween.js');

require('webvr-polyfill');

var Character = require('./assets/Character');

var CustomController = require('./assets/CustomController');

var isMobile = require('ismobilejs');

var EventEmitter = require('eventemitter3');
var emitter = new EventEmitter();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
var scene = new THREE.Scene();
var renderer;

// Last time the scene was rendered.
var lastRenderTime = 0;
var vrButton, vrDisplay;

var ground, character;

var customController;
var container, controls, effect;

var rayInput;

function App () {
  function init () {
    // WebVR Boilerplate.
    WebVRConfig.BUFFER_SCALE = 1.0;
    // WebVRConfig.CARDBOARD_UI_DISABLED = true;
    // WebVRConfig.ROTATE_INSTRUCTIONS_DISABLED = true;
    // WebVRConfig.TOUCH_PANNER_DISABLED = true;
    // WebVRConfig.MOUSE_KEYBOARD_CONTROLS_DISABLED = true;
    // WebVRConfig.YAW_ONLY = true;
    // ENABLE_DEPRECATED_API: false,
    // FORCE_ENABLE_VR: true,

    container = document.querySelector('body');

    // Create the renderer.
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xdbdbdb);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene.add(camera);

    // Apply VR headset positional data to camera.
    controls = new THREE.VRControls(camera);
    controls.standing = true;
    camera.position.set (0, controls.userHeight, 0);

    // Apply VR stereo rendering to renderer.
    effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    var light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // Create 3D objects in scene.

    character = new Character(this);
    character.position.set(0, controls.userHeight, -3.6);
    // character.rotation.z = Math.PI/2;
    scene.add(character);

    window.addEventListener('resize', onResize, false);
    window.addEventListener( 'vrdisplaypresentchange', onResize, false );

    // Initialize the WebVR UI.
    var uiOptions = {
      color: 'black',
      background: 'white',
      corners: 'square'
    };

    vrButton = new webvrui.EnterVRButton(renderer.domElement, uiOptions);
    vrButton.on('exit', function() {
      camera.quaternion.set(0, 0, 0, 1);
      camera.position.set(0, controls.userHeight, 0);
    });
    vrButton.on('hide', function() {
      document.getElementById('ui').style.display = 'none';
    });
    vrButton.on('show', function() {
      document.getElementById('ui').style.display = 'inherit';
    });
    document.getElementById('vr-button').appendChild(vrButton.domElement);
    document.getElementById('magic-window').addEventListener('click', function() {
      vrButton.requestEnterFullscreen();
    });

    rayInput = new RayInput(camera);
    rayInput.setSize(renderer.getSize());
    rayInput.on('raydown', (opt_mesh) => { handleRayDown_(opt_mesh) });
    rayInput.on('rayup', (opt_mesh) => { handleRayUp_(opt_mesh) });
    rayInput.on('raycancel', (opt_mesh) => { handleRayCancel_(opt_mesh) });
    rayInput.on('rayover', (mesh) => { setSelected_(mesh, true) });
    rayInput.on('rayout', (mesh) => { setSelected_(mesh, false) });
    console.log(rayInput);
    // For high end VR devices like Vive and Oculus, take into account the stage
    // parameters provided.
    // rayInput.add(cube);
    // rayInput.add(character);
    customController = new CustomController(rayInput);
    scene.add(customController);

    scene.add(rayInput.getMesh());

    setupStage();
  }

  function handleRayDown_(opt_mesh) {
    setAction_(opt_mesh, true);
  }

  function handleRayUp_(opt_mesh) {
    setAction_(opt_mesh, false);
  }

  function handleRayCancel_(opt_mesh) {
    setAction_(opt_mesh, false);
  }

  function setSelected_(opt_mesh, isSelected) {
    console.log('setSelected_', isSelected);
    // opt_mesh.over(isSelected);
    if(isSelected){
       opt_mesh.material.opacity = 0.7;
    }else{
       opt_mesh.material.opacity = 1;
    }
  }

  function setAction_(opt_mesh, isActive) {
    console.log('setAction_', !!opt_mesh, isActive);
    if (opt_mesh) {
      // opt_mesh.active(isActive);
       if(isActive){
       opt_mesh.material.opacity = 0.4;
    }else{
       opt_mesh.material.opacity = 0.7;
    }
    }
  }

  function onResize (event) {
    effect.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    rayInput.setSize(renderer.getSize());
  }

  // Get the HMD, and if we're dealing with something that specifies
  // stageParameters, rearrange the scene.
  function setupStage() {
    navigator.getVRDisplays().then(function(displays) {
      if (displays.length > 0) {
        vrDisplay = displays[0];
        if (vrDisplay.stageParameters) {
          setStageDimensions(vrDisplay.stageParameters);
        }
        vrDisplay.requestAnimationFrame(animate);
      }
    });
  }

  function setStageDimensions(stage) {
    // Make the scene fit the stage.
  }

  // Request animation frame loop function
  function animate(timestamp) {
    var delta = Math.min(timestamp - lastRenderTime, 500);
    lastRenderTime = timestamp;

    // Only update controls if we're presenting.
    if (vrButton.isPresenting()) {
      controls.update();
    }
    // Render the scene.
    effect.render(scene, camera);
    vrDisplay.requestAnimationFrame(animate);

    // Apply rotation to cube mesh
    // cube.rotation.y += delta * 0.0003;
    // character.rotation.z += delta * 0.0008;
    rayInput.update();
    customController.update(delta,timestamp);
    TWEEN.update();

    character.update(delta, timestamp);
  }


  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    init: init
  };
}

module.exports = new App();
