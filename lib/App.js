'use strict';

import RayInput from './ray/ray-input';

const webvrui = require('webvr-ui');
const VREffect = require('./effects/VREffect');
const VRControls = require('./controls/VRControls');

const TWEEN = require('tween.js');

require('webvr-polyfill');

const Sky = require('./assets/Sky');
const Ground = require('./assets/Ground');

const Desk = require('./assets/Desk');

const You = require('./assets/You');
const Friend = require('./assets/Friend');

const isMobile = require('ismobilejs');

const HUD = require('./HUD');
const Network = require('./Network');
let hud, network;

const EventEmitter = require('eventemitter3');
const emitter = new EventEmitter();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
const scene = new THREE.Scene();
let renderer;

const rayInput = new RayInput(camera);

// Last time the scene was rendered.
let lastRenderTime = 0;
let vrButton, vrDisplay;

let characterGroup;
let sky, ground, desk, you, friend;
let isConnected = false;

let expressions;

const controls = new THREE.VRControls(camera);

let container, effect;

let speak = {};

let roomID;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

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

    container = document.querySelector('#webgl-content');

    // Create the renderer.
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xdbdbdb);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene.add(camera);
    
    // Apply VR headset positional data to camera.
    controls.standing = true;
    camera.position.set (0, controls.userHeight, 0);

    // Apply VR stereo rendering to renderer.
    effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    var light = new THREE.AmbientLight(0xf4f4f4, 1);
    scene.add(light);

    scene.fog = new THREE.Fog(0xa4c8df, 0, 50);

    // Create 3D objects in scene.
    rayInput.setSize(renderer.getSize());
    rayInput.on('raydown', (opt_mesh) => { handleRayDown_(opt_mesh) });
    rayInput.on('rayup', (opt_mesh) => { handleRayUp_(opt_mesh) });
    rayInput.on('raycancel', (opt_mesh) => { handleRayCancel_(opt_mesh) });
    rayInput.on('rayover', (mesh) => { setSelected_(mesh, true) });
    rayInput.on('rayout', (mesh) => { setSelected_(mesh, false) });
    // For high end VR devices like Vive and Oculus, take into account the stage
    // parameters provided.
    scene.add(rayInput.getMesh());

    sky = new Sky();
    scene.add(sky);

    ground = new Ground();
    scene.add(ground);

    desk = new Desk();
    desk.position.set(0,controls.userHeight-0.55,-1.4);
    scene.add(desk);

    window.addEventListener('resize', onResize, false);
    window.addEventListener( 'vrdisplaypresentchange', onResize, false );

    // Initialize the WebVR UI.
    var uiOptions = {
      color: 'white',
      background: '#d0c500',
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

    hud = new HUD(this);
    network = new Network(this);

    emitter.on('networkConnected', networkConnected.bind(this));

    if (hasGetUserMedia()) {
      // console.log('getUserMedia() supported');

      // home - root url
      // room - valid roomID into URL
      // error - invalid roomID
      var connMode = hud.checkURL();
      switch (connMode) {
        case 'home':
          roomID = hud.getRandomRoom();
          if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            navigator.mediaDevices.getUserMedia( {audio:true}, gotStream, errorStream );
          }else{
            navigator.getUserMedia( {audio:true}, gotStream, errorStream );
          }
          break;
        case 'room':
          var url = location.href;
          var index = url.indexOf( '?' );
          roomID = url.slice( index + 1 );
          if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
            navigator.mediaDevices.getUserMedia( {audio:true}, gotStream, errorStream );
          }else{
            navigator.getUserMedia( {audio:true}, gotStream, errorStream );
          }
          break;
        case 'error':
          break;
      }
    } else {
      // alert('getUserMedia() is not supported in your browser');
      hud.error('WebRTC is not supported in your browser.');
    }
    setupStage();
  }

  function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
  }

  // success callback when requesting audio input stream
  function gotStream(stream) {
    network.init(stream, roomID);
  }

  function networkConnected(bool) {
    if(bool){
      you = new You(this);
      scene.add(you);
      friend = new Friend(this);
      isConnected = true;
    }
  }

  function errorStream(error) {
    console.log(error);
    hud.error('Stream error:', error);
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
    // console.log('setSelected_', isSelected);
    if (opt_mesh) {
      opt_mesh.over(isSelected);
    }
  }

  function setAction_(opt_mesh, isActive) {
    // console.log('setAction_', !!opt_mesh, isActive);
    if (opt_mesh) {
      opt_mesh.active(isActive);
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
    rayInput.update();

    TWEEN.update();
    if(isConnected){
      you.update(delta, timestamp);
      friend.update(delta, timestamp);
    }

    network.update();
  }

  function addFriend(){
    scene.add(friend);
  }

  function getFriendsHeadMesh() {
    return friend.head.mesh;
  }

  function getFriendsHandRMesh() {
    return friend.handR.mesh;
  }

  function getFriendsHandLMesh() {
    return friend.handL.mesh;
  }

  function setFriendHanded(isLeftHanded) {
    friend.setHanded(isLeftHanded);
  }

  function getIfYouIsLeftHanded() {
    return you.isLeftHanded;
  }

  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    init: init,
    rayInput: rayInput,
    emitter:emitter,
    speak: speak,
    controls:controls,
    addFriend: addFriend,
    getFriendsHeadMesh:getFriendsHeadMesh,
    getFriendsHandRMesh:getFriendsHandRMesh,
    getFriendsHandLMesh:getFriendsHandLMesh,
    setFriendHanded:setFriendHanded,
    getIfYouIsLeftHanded:getIfYouIsLeftHanded
  };
}

module.exports = new App();
