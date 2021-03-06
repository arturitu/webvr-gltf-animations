'use strict';

let synced = false;
let remoteSync;
let clientId;

const audioContextLocal = new ( window.AudioContext || window.webkitAudioContext )();
const audioContextRemote = new ( window.AudioContext || window.webkitAudioContext )();
let mediaStreamSourceLocal, mediaStreamSourceRemote;
let analyser, frequencyData;

let roomID;

const audio = document.querySelector('audio');

function Network (app) {
  this.app = app;
}

Network.prototype = Object.create(Object.prototype);

Network.prototype.init = function (stream, room){

  roomID = room;
  remoteSync = new THREE.RemoteSync(
    new THREE.WebRTCClient(
      new THREE.FirebaseSignalingServer( {
        authType: 'anonymous',
        apiKey: 'AIzaSyCw8XZ2BSG8C4zK1VzEQUmUD8imNoVXnX4',
        authDomain: 'emojichat-1ebe6.firebaseapp.com',
        databaseURL: 'https://emojichat-1ebe6.firebaseio.com'
      } ),
    { stream: stream }
    )
  );
  remoteSync.addEventListener( 'open', onOpen.bind(this) );
  remoteSync.addEventListener( 'close', onClose.bind(this) );
  remoteSync.addEventListener( 'error', onError.bind(this) );
  remoteSync.addEventListener( 'connect', onConnect.bind(this) );
  remoteSync.addEventListener( 'disconnect', onDisconnect.bind(this) );
  remoteSync.addEventListener( 'receive', onReceive.bind(this) );
  remoteSync.addEventListener( 'add', onAdd.bind(this) );
  remoteSync.addEventListener( 'remove', onRemove.bind(this) );
  remoteSync.addEventListener( 'remote_stream', onRemoteStream.bind(this) );
  // If you use these methods:
  // RemoteSync.sendUserData(id, data)
  // RemoteSync.broadcastUserData(data)
  // You can transfer data what you like. Just for giving a user-data transfer way to user.
  remoteSync.addEventListener( 'receive_user_data', onReceiveUserData.bind(this) );

  this.app.emitter.on('headLoaded', addLocalHead);
  this.app.emitter.on('handRAdded', addLocalHandR);
  this.app.emitter.on('handLAdded', addLocalHandL);
  this.app.emitter.on('handChanged', handChanged);
  onStream(stream);
}

function addLocalHead(obj) {
  remoteSync.addLocalObject( obj, { type: 'head' } );
}

function addLocalHandR(obj, isLeftHanded) {
  remoteSync.addLocalObject( obj, { type: 'handR' } );
  if(!isLeftHanded){
    remoteSync.broadcastUserData({'leftHanded': isLeftHanded});
  }
}

function addLocalHandL(obj, isLeftHanded) {
  remoteSync.addLocalObject( obj, { type: 'handL' } );
  if(isLeftHanded){
    remoteSync.broadcastUserData({'leftHanded': isLeftHanded});
  }
}

function handChanged(activeHand) {
  console.log('todo');
}

function onOpen( id ) {
  clientId = id;
  this.app.emitter.emit('networkConnected', true);
  // remoteSync.addSharedObject( sphere, 0 );
  connect( roomID );
  console.log('open', id);
}

function connect( id ) {
  console.log('connect', id);
  if ( id === clientId ) {
    console.log('trying to connect, but', id, 'is your id');
    return;
  }
  remoteSync.connect( id );

}

function onReceive( data ) {
  // console.log('onReceive', data);
}

function onReceiveUserData( data ) {
  // console.log('receiveUserData', data);
  if(data.hasOwnProperty('leftHanded')){
    this.app.setFriendHanded(data.leftHanded);
  }
}

function onAdd( destId, objectId, info ) {
  console.log('add friend\'s', info.type);
  switch ( info.type ) {
    case 'head':
      this.app.addFriend();
      remoteSync.addRemoteObject( destId, objectId, this.app.getFriendsHeadMesh() );
      break;
    case 'handR':
      remoteSync.addRemoteObject( destId, objectId, this.app.getFriendsHandRMesh() );
      break;
    case 'handL':
      remoteSync.addRemoteObject( destId, objectId, this.app.getFriendsHandLMesh() );
      break;
  }
}

function onRemove( destId, objectId, object ) {
  console.log('onRemove', destId, objectId, object);
  if ( object.parent !== null ){
    object.parent.remove( object );
    if(object.name === 'friend'){
      this.app.removeFriend();
    }
  }
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
  // console.log('Uncomment on PRODUCTION');
  audio.srcObject = stream;
}

function onClose( destId ) {
  console.log( 'Disconnected with ' + destId );
  this.app.emitter.emit('networkConnected', false);
}

function onError( error ) {
  console.log( error );
}

function onConnect( destId ) {
  console.log( 'Connected with ' + destId );
  this.app.emitter.emit('connected',false);
  remoteSync.broadcastUserData({'leftHanded': this.app.getIfYouIsLeftHanded()});
}

function onDisconnect( destId, object ) {
  console.log( 'Disconnected with ' + destId );
  this.app.emitter.emit('disconnected',false);
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
