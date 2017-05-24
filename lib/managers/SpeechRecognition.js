'use strict';

function SpeechRecognition () {
  THREE.Object3D.call(this);
  this.recognition = new webkitSpeechRecognition();
  this.recognition.lang = 'en-US';
  this.recognition.continuous = true;
  this.recognition.interimResults = true;

  this.final_transcript = '';
  var self = this;

  this.recognition.onresult = function( event ) {
    // console.log( event );
    var interim_transcript = '';
    for ( var i = event.resultIndex; i < event.results.length; ++ i ) {
      if ( event.results[ i ].isFinal ) {
        self.final_transcript += event.results[ i ][ 0 ].transcript;
        self.stop();
        // var event = new CustomEvent( 'recognized', { 'transcript': final_transcript } );
        self.dispatchEvent( { type: 'recognized', text: self.final_transcript } );
      } else {
        interim_transcript += event.results[ i ][ 0 ].transcript;
      }
    }
    // console.log( interim_transcript );
    // console.log( self.final_transcript );
  }

  this.recognition.onstart = function( event ) {
  console.log( 'audio start' );
  }

  this.recognition.onend = function( event ) {
    console.log( 'audio end' );
    // this.stop();
    self.start();
  }

  // this.recognition.onend = function( event ) {
  //
  // 	console.log( 'endddd' );
  //
  // }

  this.recognition.onerror = function( error ) {
    console.log( 'error', error );
  }

  this.recognition.onnomatch = function() {
    console.log( 'no match' );
  }
}

SpeechRecognition.prototype = Object.create(THREE.Object3D.prototype);

SpeechRecognition.prototype.start = function () {
  this.final_transcript = '';
  this.recognition.start();
}

SpeechRecognition.prototype.stop = function () {
    this.recognition.stop();
}

module.exports = SpeechRecognition;
