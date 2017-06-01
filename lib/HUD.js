'use strict';

function HUD (app) {
  this.app = app;
  document.querySelector('#create-button').addEventListener('click', redirectHome.bind(this));
}

function redirectHome() {
  window.location.href = '/';
}
HUD.prototype = Object.create(Object.prototype);

HUD.prototype.error = function (msg){
  document.querySelector('#room').style.display = 'none';
  document.querySelector('#create-button').style.display = 'none';
  document.querySelector('#vr-button').style.display = 'none';
  document.querySelector('#magic-window').style.display = 'none';

  document.querySelector('#alert').style.display = 'block';
  document.querySelector('#alert').innerHTML = msg;
}

HUD.prototype.getRandomRoom = function (){
    const possibleNumbers = "0123456789";
    const possibleLetters = "abcdefghmnprstvxyz";

    let roomID = "";
		roomID += possibleLetters.charAt(Math.floor(Math.random() * possibleLetters.length));
		roomID += possibleNumbers.charAt(Math.floor(Math.random() * possibleNumbers.length));
		roomID += possibleLetters.charAt(Math.floor(Math.random() * possibleLetters.length));
		roomID += possibleNumbers.charAt(Math.floor(Math.random() * possibleNumbers.length));
    document.querySelector('#url').value = 'talk.unboring.net/' + roomID;
    return roomID;
}

// home - root url
// room - valid roomID into URL
// error - invalid roomID
HUD.prototype.checkURL = function (){
  var url = location.href;
  var index = url.indexOf( '?' );
  if ( index >= 0 ) {
    var id = url.slice( index + 1 );
    if(isValidID(id)){
      document.querySelector('h3').style.display = 'none';
      document.querySelector('#room').style.display = 'none';
      document.querySelector('#alert').style.display = 'block';
      document.querySelector('#alert').innerHTML = 'Welcome to <strong>' + id + '</strong> room!';
      return 'room';
    }else{
      document.querySelector('h3').style.display = 'block';
      document.querySelector('#vr-button').style.display = 'none';
      document.querySelector('#magic-window').style.display = 'none';

      document.querySelector('#create-button').style.display = 'block';
      document.querySelector('#room').style.display = 'none';
      document.querySelector('#alert').style.display = 'block';
      document.querySelector('#alert').innerHTML = 'Room ID does not exist.';
      return 'error';
    }
  }else{
    document.querySelector('h3').style.display = 'block';
    document.querySelector('#room').style.display = 'inline-flex';
    return 'home';
  }
}

function isValidID(s){
  if(s.length === 4 && isLetter(s.substr(0,1)) && isNumber(s.substr(1,1)) && isLetter(s.substr(2,1)) && isNumber(s.substr(3,1)) ){
    return true;
  }else{
    return false;
  }
}

function isNumber(s){
  if(s.match(/^[0-9]+$/) != null){
    return true;
  }else{
    return false;
  }
}

function isLetter(s){
  if(s.match(/[a-z]/i) != null){
    return true;
  }else{
    return false;
  }
}

module.exports = HUD;
