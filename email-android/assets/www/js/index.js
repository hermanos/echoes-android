function startupWin(result) {
    if (result == TTS.STARTED) {
        window.plugins.tts.speak("Echoes!");
    }
}
function ChangeLanguageWin(result) {
//    window.plugins.tts.speak("bongiorno italia");
}
function fail(result) {
    alert("TTS Startup failure = " + result);
}
function win(result) {
}

function closeSplash(){
	navigator.splashscreen.hide();
}

//00-splash,    01-tutorial1, 02-tutorial2,    03-tutorial3, 04-add email, 05-sync
//              11-compose,   12-inbox,        13-sent,      14-trash,     15-archive, 16-settings
//20-reply all, 21-reply,     22-read message, 23-forward 	 24-contacts

var currentScreen = 0;
var menus = ['splash' ,'tutorial page 1' ,'tutorial page 2' ,'tutorial page 3' ,'add email' ,'syncronization', '', '', '', '', 
             'contacts-compose', 'compose', 'inbox', 'sent', 'trash', 'archive', 'settings', '', '', '', 
             'reply all', 'reply', 'read message', 'forward', 'contacts-forward'];

var currentMessage = null;

// stage: 0=new, 1=tutorial, 2=added email, 3=sync'd
var currentUser = { id: 1, name: 'Barrack Obama', language: 'en', stage: 1 };
var mailbox = [];
mailbox['inbox'] = {
			current: -1,
			messages: []
			};
mailbox['sent'] =  {
				current: -1,
				messages: []
			};
mailbox['archive'] = {
				current: -1,
				messages: []
			};
mailbox['trash'] =  {
				current: -1,
				messages :[]
			}

var contacts = [];
var currentContact = -1;

$(document).ready(function(){

	// initialize TTS services
	window.plugins.tts.startup(startupWin, fail);
	// window.plugins.tts.setLanguage('it', ChangeLanguageWin, fail);
	// initialize local storage
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
	afterMenuSelect();
	
	// gestures handlers
	$("#events").swipe({
	    swipe:function(event, direction, distance, duration, fingerCount) {
	    	previousScreen = currentScreen;
  
		    if (direction == 'left'){
			    if([0,1,2,3,11,12,13,14,15,20,21,22,4].indexOf(currentScreen) > -1) currentScreen += 1;
			    window.plugins.tts.stop(win, fail);
			    afterMenuSelect();
		    }

    		if (direction == 'right'){
    			if([1,2,3,4,12,13,14,15,16,21,22,23].indexOf(currentScreen) > -1) currentScreen -= 1;
    			window.plugins.tts.stop(win, fail);
    			afterMenuSelect();
    		}
		  
    		if (direction == 'down'){
    			if ([12].indexOf(currentScreen) > -1 && mailbox['inbox'].current >= 0){
    				mailbox['inbox'].current += 1;
    				window.plugins.tts.stop(win, fail);
			  	  	if (mailbox['inbox'].current >= mailbox['inbox'].messages.length) mailbox['inbox'].current = mailbox['inbox'].messages.length - 1;
			  	  	afterMessageSelect();
    			}
    			
    			if ([13].indexOf(currentScreen) > -1 && mailbox['sent'].current >= 0){
    				mailbox['sent'].current += 1;
    				window.plugins.tts.stop(win, fail);
			  	  	if (mailbox['sent'].current >= mailbox['sent'].messages.length) mailbox['sent'].current = mailbox['sent'].messages.length - 1;
			  	  	afterMessageSelect();
    			}
    			
    			if ([14].indexOf(currentScreen) > -1 && mailbox['archive'].current >= 0){
    				mailbox['archive'].current += 1;
    				window.plugins.tts.stop(win, fail);
			  	  	if (mailbox['archive'].current >= mailbox['archive'].messages.length) mailbox['archive'].current = mailbox['archive'].messages.length - 1;
			  	  	afterMessageSelect();
    			}
    			
    			if ([15].indexOf(currentScreen) > -1 && mailbox['trash'].current >= 0){
    				mailbox['trash'].current += 1;
    				window.plugins.tts.stop(win, fail);
			  	  	if (mailbox['trash'].current >= mailbox['trash'].messages.length) mailbox['trash'].current = mailbox['trash'].messages.length - 1;
			  	  	afterMessageSelect();
    			}
    			if ([24].indexOf(currentScreen) > -1 && currentContact >= 0){
    				currentContact += 1;
    				window.plugins.tts.stop(win, fail);
			  	  	if (currentContact >= contacts.length) currentContact = contacts.length - 1;
			  	  	afterContactSelect();
    			}
    			if ([10].indexOf(currentScreen) > -1 && currentContact >= 0){
    				currentContact += 1;
    				window.plugins.tts.stop(win, fail);
			  	  	if (currentContact >= contacts.length) currentContact = contacts.length - 1;
			  	  	afterContactSelect();
    			}
    			
    		}
		  
    		if (direction == 'up'){
    			if ([12].indexOf(currentScreen) > -1 && mailbox['inbox'].current >= 0){
    				mailbox['inbox'].current -= 1;
    				window.plugins.tts.stop(win, fail);
    				if (mailbox['inbox'].current < 0) mailbox['inbox'].current = 0;
    				afterMessageSelect();
    			}
    			
    			if ([13].indexOf(currentScreen) > -1 && mailbox['sent'].current >= 0){
    				mailbox['sent'].current -= 1;
    				window.plugins.tts.stop(win, fail);
    				if (mailbox['sent'].current < 0) mailbox['sent'].current = 0;
    				afterMessageSelect();
    			}
    			if ([14].indexOf(currentScreen) > -1 && mailbox['archive'].current >= 0){
    				mailbox['archive'].current -= 1;
    				window.plugins.tts.stop(win, fail);
    				if (mailbox['archive'].current < 0) mailbox['archive'].current = 0;
    				afterMessageSelect();
    			}
    			if ([15].indexOf(currentScreen) > -1 && mailbox['trash'].current >= 0){
    				mailbox['trash'].current -= 1;
    				window.plugins.tts.stop(win, fail);
    				if (mailbox['trash'].current < 0) mailbox['trash'].current = 0;
    				afterMessageSelect();
    			}
    			if ([24].indexOf(currentScreen) > -1 && currentContact >= 0){
    				currentContact -= 1;
    				window.plugins.tts.stop(win, fail);
    				if (currentContact < 0) currentContact = 0;
    				afterContactSelect();
    			}
    			if ([10].indexOf(currentScreen) > -1 && currentContact >= 0){
    				currentContact -= 1;
    				window.plugins.tts.stop(win, fail);
    				if (currentContact < 0) currentContact = 0;
    				afterContactSelect();
    			}
    			if([11].indexOf(currentScreen) > -1) {
	    			currentScreen = 10;
	    			window.plugins.tts.stop(win, fail);
	    			afterMenuSelect();
	    			refreshContacts();
	    		}
    			if([23].indexOf(currentScreen) > -1) {
	    			currentScreen = 24;
	    			window.plugins.tts.stop(win, fail);
	    			afterMenuSelect();
	    			refreshContacts();
	    		}
    			
			}
	    },
	    
	    longTap:function(event, target) {
	    	if ($(target).attr("id") == 'help') {
				window.plugins.tts.speak('Help. ' + $('#page-' + currentScreen + ' .read-help').text());
	    	} else {
	    		if([12,13,14,15].indexOf(currentScreen) > -1) refreshMessages('');
	    		if([0,1,2,3,4].indexOf(currentScreen) > -1) afterMenuSelect();
    		}
	    },
	    
	    tap:function(event, target) {
	    	if ([12,13,14,15].indexOf(currentScreen) > -1){
    			window.plugins.tts.stop(win, fail);

	    		if (mailbox['inbox'].messages.length > 0){
					currentScreen = 22;
					currentMessage = mailbox['inbox'].messages[mailbox['inbox'].current];
					afterMenuSelect();
				} else {
					window.plugins.tts.speak('No messages. Refresh messages with long tap.');
				}
	    	} 
	    	else {
		    	if (currentScreen == 22){
	    			window.plugins.tts.stop(win, fail);
		    		currentScreen = 12;
		    		afterMenuSelect();
		    		afterMessageSelect();
		    	}	   
		    	if(currentScreen == 24){
		    		window.plugins.tts.stop(win, fail);
		    		currentScreen = 23;
		    		afterMenuSelect();
		    		$('p.contact-email').text(contacts[currentContact].email);
		    	}
		    	if(currentScreen == 10){
		    		window.plugins.tts.stop(win, fail);
		    		currentScreen = 11;
		    		afterMenuSelect();
		    		$('p.contact-email').text(contacts[currentContact].email);
		    	}
	    	}
	    }

	    function gotFS(fileSystem){
	    	fileSystem.root.getFile("word", {create: true, exclusive: false}, win, fail);
	    }
	    
	    function registerAccount(){
	    	var rand = function(){
	    		return Math.random().toString(36).substr(2);
	    	};
	    	var phone = device.uuid;
	    	var password = $.md5(rand());
	    	create_writer = function(fileEntry) {
	    	                    fileEntry.createWriter(write_file, onFileSystemError);
	    	                };
	    	write_file = function(writer){
	    		writer.write(password);
	    	};
	    	$ajax({
	    		type: "POST",
	    		url: 'http://staging.echoesapp.com/signup.json'
	    		dataType: 'json',
	    		headers: { 'Content-Type': 'application/json' },
	    		data: {
	    			user: {
	    				email: 'user_' + device.uuid + '@audioguide.com',
	    				password: password,
	    				password_confirmation: password
	    			}
	    		},
	    		success: function(response){
	    			if(response.success){
	   					alert("Successfuly registered");
	   					fileSystem.root.getFile("word", null, create_writer, fail);	
	    			}
	    		},
	    	});
	    }
	});
	
	function afterMenuSelect(){

		if (currentScreen == 0){
			if (currentUser.stage == 1){
				currentScreen = 4;
				afterMenuSelect();
				return;
			}
			if (currentUser.stage == 2){
				currentScreen = 5;
				afterMenuSelect();
				return;
			}
			if (currentUser.stage == 3){
				currentScreen = 12;
				afterMenuSelect();
				return;
			}
		}

		if (currentScreen == 4){
			// TODO: save currentUser.stage = 1 (tutorial finished)
			// daca a ajuns la add email, atunci data viitoare de pe splash page il duce direct pe add email
			if (currentUser.stage == 0) currentUser.stage = 1;
		}

		if (currentScreen == 5){
			// TODO: incearca credentials de pe screen 4
			// a) daca nu sunt ok, atunci currentScreen = 4 si return (cu un notice eventual)
			// b) daca sunt ok, atunci incepe sincronizarea si save currentUser.stage = 2 (added email)
			// Pe callbackul de succes currentUser.stage = 3 (sync'd) si redirecteaza catre users
			currentScreen = 12; // redirect to inbox
			currentUser.stage = 3;
		}
		
		$('.page').hide();
		$('#page-' + currentScreen).show();
		$('#status').html(currentScreen);
		
		window.plugins.tts.speak($('#page-' + currentScreen + ' .read-text').text());
		
		if (currentScreen == 22){
			afterMessageSelect();
			readCurrentMessage();
		}
	}
	
	function afterMessageSelect(){
		if ([12,13,14,15].indexOf(currentScreen) > -1 && mailbox['inbox'].current >= 0){
			currentMessage = mailbox['inbox'].messages[mailbox['inbox'].current];
			window.plugins.tts.speak('' + mailbox['inbox'].messages.length + ' messages. message ' + mailbox['inbox'].current);
			window.plugins.tts.speak(mailbox['inbox'].messages[mailbox['inbox'].current].subject);
		}
	}
	
	// retrieve messages	
	function refreshMessages(folder){
		window.plugins.tts.speak('refreshing messages');
		
		$.ajax({
            type: "GET",
            url: 'http://staging.echoesapp.com/messages.json',
            dataType: 'json',
            data: {
            	current_user: currentUser.id
            },
            success: function(response){
            	mailbox['inbox'].messages = [];
            	mailbox['inbox'].current = -1;
            	response.forEach(function(element, index, array) {
//            		 mailbox['inbox'].messages.push(element);
            		 mailbox[element['folder']].messages.push(element);
            		
            	});
        		if (mailbox['inbox'].messages.length > 0){
        			mailbox['inbox'].current = 0;
                	afterMessageSelect();
        		}
            },
            error: function(error) {
           	window.plugins.tts.speak('error: ' + error.statusText);
            }
        });		
	}
	
	function readCurrentMessage(){
		window.plugins.tts.speak("From:" + currentMessage.from);
		window.plugins.tts.speak("To:" + currentMessage.to);
		window.plugins.tts.speak("Subject:" + currentMessage.subject);
		window.plugins.tts.speak("Content:" + currentMessage.content);		  

	}

//		read message		
//		current_user_id = 1;
//		message_id = 4;
//        $.ajax({
//            type: "GET",
//            url: 'http://staging.echoesapp.com/messages/' + message_id + '.json',
//            dataType: 'json',
//            data: {},
//            success: function(response){
//            	window.plugins.tts.speak(response['content']);
//            },
//            error: function(error) {
//              alert(error.statusText);
//            }
//        });		
//		

	
	// retrieve contacts	
	function refreshContacts(){
		window.plugins.tts.speak('refreshing contacts');
		
		$.ajax({
            type: "GET",
            url: 'http://staging.echoesapp.com/contacts.json',
            dataType: 'json',
            data: {
            	current_user: currentUser.id
            },
            success: function(response){
            	contacts = [];
            	currentContact = -1;
            	response.forEach(function(element, index, array) {
            		 contacts.push(element);
            	});
        		if (contacts.length > 0){
        			currentContact = 0;
                	afterContactSelect();
        		}
            },
            error: function(error) {
//            	window.plugins.tts.speak('error: ' + error.statusText);
            	alert(error.statusText);
            }
        });	
	}
	
	function afterContactSelect(){
		if ([10,24].indexOf(currentScreen) > -1 && currentContact >= 0){
			window.plugins.tts.speak('' + contacts.length + ' contacts. contact ' + currentContact);
			readCurrentContact();
		}
	}
	
	function readCurrentContact(){
		window.plugins.tts.speak("Name:" + contacts[currentContact].name);
		window.plugins.tts.speak("Email:" + contacts[currentContact].email);	  
	}
	

 $("#sync-button").click(
		 function () {
			 $.ajax({
				 type: "POST",
				 url: 'http://staging.echoesapp.com/api/updatemail.json',
				 headers:  {'Content-Type' : 'application/json'},
				 data: {email_address: $('#email-input').text() , email_password: $('#password-input').text()},
				 dataType: 'json',
				 
				 success: function (response) {
					 alert(response);
					 if (response.success == true) {
						 afterMenuSelect();
					 }else {
						 alert("Email or password incorrect");
						 window.plugins.tts.speak("Email or password incorrect");
					 }
	       
				 },
				 error: function (error) {
					 alert("Something went wrong");
				 }
			 });
		});
	
	


	  // detect language
//	  $.ajax({
//          type: "GET",
//          url: 'http://ws.detectlanguage.com/0.2/detect', 
//          dataType: 'json',
//          data: {
//          	q: encodeURIComponent(mailbox['inbox'].messages[mailbox['inbox'].current].subject + ' ' + mailbox['inbox'].messages[mailbox['inbox'].current].content),
//          	key: '54eead2bd73d8072e015059bf234b645'
//          },
//          success: function(response){
//      		window.plugins.tts.speak('language: ' + response.data.detections[0].language);
//	  			// aici trebuie echivalata limba detectata cu una din familiile suportate de android
//      		window.plugins.tts.setLanguage(response.data.detections[0].language, ChangeLanguageWin, fail);
//          },
//          error: function(error) {
////          	window.plugins.tts.speak('error: ' + error.statusText);
//          }
//      });		

	
});

//-----------------------------------------//
//--------------RECORD------------------/
var src;
var mediaRec;

 function recordAudio() {
        src = "echomessage.mp3";
        mediaRec = new Media(src, onSuccess, onError);
        
        // Record audio
        mediaRec.startRecord();
		
        // Stop recording after 30 sec
        var recTime = 0;
        var recInterval = setInterval(function() {
            recTime = recTime + 1;
          
            if (recTime >= 30) {
                clearInterval(recInterval);
                mediaRec.stopRecord();
            }
         
        }, 1000);
        
    }
    //--------------STOP REC --------------//
	function stopRec(){
			
			mediaRec.stopRecord();
	}
     
    //-------------- PLAY--------------------//
    
        // Play audio

       function playAudio(src) {
        var src = "echomessage.mp3";
        var my_media = null;
        var mediaTimer = null;
            if (my_media == null) {
                // Create Media object from src
                my_media = new Media(src, onSuccess, onError);
            } // else play current audio
            // Play audio
            my_media.play();

            // Update my_media position every second
            if (mediaTimer == null) {
                mediaTimer = setInterval(function() {
                    // get my_media position
                    my_media.getCurrentPosition(
                        // success callback
                        function(position) {
                            if (position > -1) {
                                setAudioPosition((position) + " sec");
                            }
                        },
                        // error callback
                        function(e) {
                            console.log("Error getting pos=" + e);
                            setAudioPosition("Error: " + e);
                        }
                    );
                }, 1000);
            }
        }



 // Cordova is ready
    //
    function onDeviceReady() {
        recordAudio();
    }

    // onSuccess Callback
    //
    function onSuccess() {
        console.log("recordAudio():Audio Success");
    }

    // onError Callback 
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' + 
              'message: ' + error.message + '\n');
    }
	 
function setAudioPosition(position) {
            document.getElementById('audio_position').innerHTML = position;
        }
     
//----------------------Show & Hide buttons-----------------------------//        
$(document).ready(function(){
  $(".stoprecordclass").hide();
  $(".startrecordclass").click(function(){

  $(".startrecordclass").hide();
  $(".stoprecordclass").show();
  recordAudio();
  
  
  });
 $(".stoprecordclass").click(function(){
  $(".stoprecordclass").hide();
  stopRec();
  $(".startrecordclass").show();
  });
});