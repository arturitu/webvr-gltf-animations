'use strict';

let remoteSync;
let clientId;

const audioContextLocal = new AudioContext();
const audioContextRemote = new AudioContext();
let mediaStreamSourceLocal, mediaStreamSourceRemote;
let analyser, frequencyData;

let mesh;

let roomID;

const audio = document.querySelector('audio');

function Network (app) {
  this.app = app;
}

Network.prototype = Object.create(Object.prototype);

Network.prototype.init = function (stream, room){

  roomID = room;
  remoteSync = new THREE.RemoteSync(
    new THREE.FirebaseClient( {
      authType: 'anonymous',
      apiKey: 'AIzaSyCw8XZ2BSG8C4zK1VzEQUmUD8imNoVXnX4',
      authDomain: 'emojichat-1ebe6.firebaseapp.com',
      databaseURL: 'https://emojichat-1ebe6.firebaseio.com',
      stream: stream
    } )
  );
  remoteSync.addEventListener( 'open', onOpen.bind(this) );
  remoteSync.addEventListener( 'close', onClose.bind(this) );
  remoteSync.addEventListener( 'error', onError.bind(this) );
  remoteSync.addEventListener( 'connect', onConnect.bind(this) );
  remoteSync.addEventListener( 'disconnect', onDisconnect.bind(this) );
  remoteSync.addEventListener( 'receive', onReceive.bind(this) );
  remoteSync.addEventListener( 'add', onAdd.bind(this) );
  remoteSync.addEventListener( 'remove', onRemove.bind(this) );
  remoteSync.addEventListener( 'remotestream', onRemoteStream.bind(this) );

  onStream(stream);
}

function onOpen( id ) {
  clientId = id;
  remoteSync.addLocalObject( this.app.camera, { type: 'camera' } );
  // remoteSync.addSharedObject( sphere, 0 );
  // connectFromURL();
  connect( roomID );
}

function connect( id ) {
  if ( id === clientId ) {
    console.log('trying to connect, but', id, 'is your id');
    return;
  }

  console.log('connect', id);
  remoteSync.connect( id );

}

function onReceive( data ) {
  // console.log('onReceive', data);
}

function onAdd( destId, component ) {
  console.log('onAdd',destId, component);
  var objectId = component.id;
  var info = component.info;
  mesh;
  switch ( info.type ) {
    case 'camera':
      mesh = createModel( destId );
      break;
    // case 'box':
    //   mesh = createBox();
    //   break;
    default:
      return;
  }
  this.app.scene.add( mesh );
  console.log(mesh.position);
  remoteSync.addRemoteObject( destId, objectId, mesh );
}

function createModel( id ) {
  var face = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 2.0 ),
    new THREE.MeshToonMaterial()
  );
  var eye1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 0.2 ),
    new THREE.MeshToonMaterial( { color: 0x000000 } )
  );

  eye1.position.x = 0.7;
  eye1.position.y = 0.8;
  eye1.position.z = -1.7;

  var eye2 = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 0.2 ),
    new THREE.MeshToonMaterial( { color: 0x000000 } )
  );

  eye2.position.x = -0.7;
  eye2.position.y = 0.8;
  eye2.position.z = -1.7;

  var nose = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 0.5 ),
    new THREE.MeshToonMaterial()
  );

  nose.position.z = -2.0;

  var mouse = new THREE.Mesh(
    new THREE.BoxBufferGeometry( 1.5, 0.3, 0.5 ),
    new THREE.MeshToonMaterial( { color: 0xff0000 } )
  );

  mouse.position.y = -1.0;
  mouse.position.z = -1.5;

  // var plate = createNamePlate( id );
  // plate.position.y = 3.0;

  // var plate2 = plate.clone();
  // plate2.rotation.y = Math.PI;

  face.add( eye1 );
  face.add( eye2 );
  face.add( nose );
  face.add( mouse );
  // face.add( plate );
  // face.add( plate2 );

  return face;
}

function onRemove( destId, objectId, object ) {
  console.log('onRemove', destId, objectId, object);
  if ( object.parent !== null ) object.parent.remove( object );
}

function onStream( stream ) {
  console.log( 'localStream' );
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  analyser = audioContextLocal.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = .75;
  frequencyData = new Uint8Array( analyser.fftSize );

  // Create an AudioNode from the stream.
  mediaStreamSourceLocal = audioContextLocal.createMediaStreamSource( stream );

  // Connect it to the destination to hear yourself (or any other node for processing!)
  mediaStreamSourceLocal.connect( analyser );
}

function onRemoteStream( stream ) {
  console.log( 'remoteStream' );
  // mediaStreamSourceRemote = audioContextRemote.createMediaStreamSource(stream);
  // mediaStreamSourceRemote.connect(audioContextRemote.destination);
  audio.srcObject = stream;
}

function onClose( destId ) {
  console.log( 'Disconnected with ' + destId );
}

function onError( error ) {
  console.log( error );
}

function onConnect( destId ) {
  console.log( 'Connected with ' + destId );
}

function onDisconnect( destId, object ) {
  console.log( 'Disconnected with ' + destId );
}


function getAverageFrequency(freq) {
  var value = 0, data = freq;
  for ( var i = 0; i < data.length; i ++ ) {
    value += data[ i ];
  }
  return THREE.Math.clamp(THREE.Math.mapLinear(value / data.length / analyser.fftSize, 0, 0.2, 0, 1),0,1);
}

Network.prototype.update = function (){
  if(analyser){
    analyser.getByteFrequencyData(frequencyData);
    this.app.speak.volume = getAverageFrequency(frequencyData);
    // console.log(this.app.speak.volume );
  }
  if(remoteSync){
    remoteSync.sync();
  }
}

module.exports = Network;
