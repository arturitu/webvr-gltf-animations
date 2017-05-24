// http://blog.teamtreehouse.com/getting-started-speech-synthesis-api

function SpeechSynthesis () {

	'use strict';

	this.msg = new SpeechSynthesisUtterance();
	this.msg.lang = 'en-US';
	// this.msg.lang = 'es-ES';
	this.msg.volume = 1;
	// 0.1 to 10
	this.msg.rate = 1.2;
	// 0 to 2
	this.msg.pitch = 1.7;

	this.speakReady = false;

	var self = this;
	window.speechSynthesis.onvoiceschanged = function() {
		var voices = window.speechSynthesis.getVoices();
		for(var i = 0; i < voices.length ; i++) {
			if(voices[i].lang === 'en-US'){
				console.log(voices[i].name);
				if(voices[i].name === 'Google US English'){
					self.speakReady = true;
					self.msg.voice = voices[i];
				}
			}
		}
	};

	//TODO get the time of the speech to adjust mouth http://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working
	// this.msg.onstart = function ( e ) {
	//
	// }
	//
	// this.msg.onend = function ( e ) {
	//
	// }

}

SpeechSynthesis.prototype.speak = function ( text ) {
	if ( ! this.speakReady ) {

		return;

	}
	// console.log( 'speak' );
	// Set the text.
	this.msg.text = text;
	// Queue this utterance.
	window.speechSynthesis.speak( this.msg );
}

module.exports = SpeechSynthesis;
