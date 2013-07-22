/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


$(document).ready(function(){

	window.plugins.tts.startup(startupWin, startupFail);
	
	function startupWin(result) {
	    // When result is equal to STARTED we are ready to play
	    if (result == TTS.STARTED) {
	        window.plugins.tts.speak("The text to speech service is ready");
	    }
	}
	function startupFail(result) {
	    console.log("Startup failure = " + result);
	}
	
	$(document).on('swipeleft','#compose', function(){ 
		$.mobile.changePage("#index"); 
		window.plugins.tts.speak("index");
	 });
	$(document).on('swiperight','#index', function(){ 
		$.mobile.changePage("#compose"); 
		window.plugins.tts.speak("compose");
	});
	$(document).on('tap','#index', function(){ 
//		$.mobile.changePage("#readmsg"); 
		window.plugins.tts.speak("reading message");
		
		current_user_id = 1;
		message_id = 4;
        $.ajax({
            type: "GET",
            url: 'http://staging.echoesapp.com/messages/' + message_id + '.json',
            dataType: 'json',
            data: {},
            success: function(response){
            	window.plugins.tts.speak(response['content']);
            },
            error: function(error) {
              alert(error.statusText);
            }
        });		
		
	});
	$(document).on('doubletap','#readmsg', function(){ 
		$.mobile.changePage("#index"); 
		window.plugins.tts.speak("index");
	 });
	$(document).on('swipeleft','#index', function(){ 
		$.mobile.changePage("#sent");
		window.plugins.tts.speak("Sent");
	 });
	$(document).on('swiperight','#sent', function(){ 
		$.mobile.changePage("#index"); 
		window.plugins.tts.speak("inbox");
		
		current_user_id = 1;
        $.ajax({
            type: "GET",
            url: 'http://staging.echoesapp.com/messages.json?current_user=' + current_user_id,
            dataType: 'json',
            data: {},
            success: function(response){
              messages = '';
              response.forEach(function(element, index, array) {
                messages += '<p data-id="' + element['id'] + '">From: ' + element['from'] + '<br>To: ' + element['to'] + '<br>Subject: ' + element['subject'] + '</p>';
              });
              $('div#index .content').html(messages);
            },
            error: function(error) {
              alert(error.statusText);
            }
        });		
		
	 });
	$(document).on('swipeleft','#sent', function()
	  		{ $.mobile.changePage("#archive"); 
			window.plugins.tts.speak("archive");
	 });
	$(document).on('swiperight','#archive', function()
	  		{ $.mobile.changePage("#sent"); 
			window.plugins.tts.speak("sent");
	 });
	$(document).on('swipeleft','#archive', function()
	  		{ $.mobile.changePage("#trash"); 
			window.plugins.tts.speak("trash");
	 });
	$(document).on('swiperight','#trash', function()
	  		{ $.mobile.changePage("#archive"); 
			window.plugins.tts.speak("archive");
	 });
	 $(document).on('swipeleft','#trash', function()
	  		{ $.mobile.changePage("#settings"); 
			window.plugins.tts.speak("settings");
	 });
	$(document).on('swiperight','#settings', function()
	  		{ $.mobile.changePage("#trash"); 
			window.plugins.tts.speak("trash");
	 });
	 $(document).on('swipeleft','#settings', function()
	  		{ $.mobile.changePage("#index"); 
			window.plugins.tts.speak("index");
	 });

});