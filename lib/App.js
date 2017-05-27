'use strict';

import RayInput from './ray/ray-input';

var webvrui = require('webvr-ui');
var VREffect = require('./effects/VREffect');
var VRControls = require('./controls/VRControls');

var SpeechRecognition = require('./managers/SpeechRecognition');
var SpeechSynthesis = require('./managers/SpeechSynthesis');

var TWEEN = require('tween.js');

require('webvr-polyfill');

var Sky = require('./assets/Sky');
var Ground = require('./assets/Ground');

var Character = require('./assets/Character');
var Hand = require('./assets/Hand');

var CustomController = require('./assets/CustomController');

var Mirror = require('./assets/Mirror');

var Expressions = require('./assets/Expressions');

var isMobile = require('ismobilejs');

var EventEmitter = require('eventemitter3');
var emitter = new EventEmitter();

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
var scene = new THREE.Scene();
var renderer;

var rayInput = new RayInput(camera);

// Last time the scene was rendered.
var lastRenderTime = 0;
var vrButton, vrDisplay;

var characterGroup;
var sky, ground, character, hand;

var expressions;

var customController;
var container, controls, effect;

var analyser, frequencyData;

var speak = {};

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

    var light = new THREE.AmbientLight(0xf4f4f4, 1);
    scene.add(light);

    // var light = new THREE.AmbientLight(0xf4f4f4, 0.6);
    // scene.add(light);

    // var keyLight = new THREE.PointLight(0xf4f4f4, 0.3, 0);
    // keyLight.position.set(3, 2, 0);
    // scene.add(keyLight);

    // var fillLight = new THREE.PointLight(0xf4f4f4, 0.3, 0);
    // fillLight.position.set(-3, 4, 0);
    // scene.add(fillLight);

    // var backLight = new THREE.PointLight(0xf4f4f4, 0.2, 0);
    // backLight.position.set(0, 4, -10);
    // scene.add(backLight);

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
    // rayInput.add(cube);
    // rayInput.add(character);
    customController = new CustomController(rayInput);
    scene.add(customController);

    scene.add(rayInput.getMesh());

    sky = new Sky();
    scene.add(sky);

    ground = new Ground();
    scene.add(ground);

    characterGroup = new THREE.Group();
    characterGroup.rotation.y = Math.PI;
    characterGroup.position.set(0, -controls.userHeight, -5);
    characterGroup.scale.set(2,2,2);
    scene.add(characterGroup);

    character = new Character(this);
    character.position.set(0, controls.userHeight, 0);
    // character.rotation.z = Math.PI/2;
    characterGroup.add(character);

    hand = new Hand(rayInput);
    // hand.position.set(0, controls.userHeight+0.5, -2);
    characterGroup.add(hand);

    // var mirror = new Mirror();
    // mirror.position.set(0,0.5,-3.5);
    // mirror.rotation.x = Math.PI/8;
    // scene.add(mirror);

    var expressions = new Expressions(this);
    expressions.position.set (0, 0, -5);
    scene.add(expressions);

    window.addEventListener('resize', onResize, false);
    window.addEventListener( 'vrdisplaypresentchange', onResize, false );

    // Initialize the WebVR UI.
    var uiOptions = {
      color: 'white',
      background: '#2e2f42',
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

    setupStage();

    if ( ('speechSynthesis' in window) && ('webkitSpeechRecognition' in window) ) {
      console.log( 'yea' );
      this.myRecognizer = new SpeechRecognition();
		  // this.myRecognizer.start();
		  this.myRecognizer.addEventListener( 'recognized', textRecognized.bind( this ) );

      this.mySpeech = new SpeechSynthesis();
      // var self = this;
      // setTimeout(function(){
      //   self.mySpeech.speak('Hello world' );
      // }, 1000);

			var scope = this;
			this.mySpeech.msg.onstart = function ( e ) {

        console.log('start speech');

			}
			this.mySpeech.msg.onend = function () {

				console.log('end speech');

			}
    } else {
      console.log( 'non' );
    }

    function hasGetUserMedia() {
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    if (hasGetUserMedia()) {
      console.log('ok');
      navigator.getUserMedia( {audio:true}, gotStream, errorStream );
    } else {
      alert('getUserMedia() is not supported in your browser');
    }
  }

  // success callback when requesting audio input stream
  function gotStream(stream) {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      var audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = .75;
      frequencyData = new Uint8Array( analyser.fftSize );

      // Create an AudioNode from the stream.
      var mediaStreamSource = audioContext.createMediaStreamSource( stream );

      // Connect it to the destination to hear yourself (or any other node for processing!)
      mediaStreamSource.connect( analyser );
  }

  function errorStream(error) {
    console.log(error);
  }

  function textRecognized(obj) {
    this.mySpeech.speak(obj.text);
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

  function getAverageFrequency(freq) {
    var value = 0, data = freq;
    for ( var i = 0; i < data.length; i ++ ) {
      value += data[ i ];
    }
    return THREE.Math.clamp(THREE.Math.mapLinear(value / data.length / analyser.fftSize, 0, 0.05, 0, 1),0,1);
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
    hand.update(delta, timestamp);
    // hand.rotation.y += delta * 0.0008;
    if(analyser){
      analyser.getByteFrequencyData( frequencyData );
      speak.volume = getAverageFrequency(frequencyData);
    }
  }


  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    init: init,
    rayInput: rayInput,
    emitter:emitter,
    speak: speak
  };
}

module.exports = new App();
