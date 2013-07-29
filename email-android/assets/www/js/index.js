//00-splash,    01-tutorial1, 02-tutorial2,    03-tutorial3, 04-add email, 05-sync
//              11-compose,   12-inbox,        13-sent,      14-trash,     15-archive, 16-settings
//20-reply all, 21-reply,     22-read message, 23-forward 	 24-contacts

var currentScreen = 0;
var menus = ['splash' ,'tutorial page 1' ,'tutorial page 2' ,'tutorial page 3' ,'add email' ,'syncronization', '', '', '', '', 
             'contacts-compose', 'compose', 'inbox', 'sent', 'trash', 'archive', 'settings', '', '', '', 
             'reply all', 'reply', 'read message', 'forward', 'contacts-forward'];

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
	    swipe: swipeCustomCallback(event, direction, distance, duration, fingerCount),
	    longTap: longTapCustomCallback(event, target),
	    tap: tapCustomCallback(event, target)	    
	});

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
    	$.ajax({
    		type: "POST",
    		url: 'http://staging.echoesapp.com/signup.json',
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
    		}
    	});
    }
	
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
		window.plugins.tts.speak("From:" + mailbox['inbox'].messages[mailbox['inbox'].current].from);
		window.plugins.tts.speak("To:" + mailbox['inbox'].messages[mailbox['inbox'].current].to);
		window.plugins.tts.speak("Subject:" + mailbox['inbox'].messages[mailbox['inbox'].current].subject);
		window.plugins.tts.speak("Content:" + mailbox['inbox'].messages[mailbox['inbox'].current].content);		  

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

});

//-----------------VARIABLES------------------------//

var mediaRec;

var randnrmsgname = Math.floor(Math.random()*1001);  // generates a random number between 1 - 1000 

var currenttimestampz = new Date();

var getcurrenttimez = "" + currenttimestampz.getFullYear() + "m" + currenttimestampz.getMonth() + "d" + currenttimestampz.getDate() + "h" + currenttimestampz.getHours() + "m" + currenttimestampz.getMinutes() + "s" + currenttimestampz.getSeconds();

var src = "echomessage" + getcurrenttimez + "rn" + randnrmsgname + ".mp3";  // src variable (message) gets timestamp + a random number + mp3 extension as a name

//--------------RECORD------------------/

 function recordAudio() {
        
        mediaRec = new Media(src, onSuccess, onError);
        
        // Record audio begins here
        mediaRec.startRecord();
		
        // Stops recording after 30 sec (default if stopRec is not called)
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

       function playAudio(srcm) {
        var srcm = src;
        var my_media = null;
        var mediaTimer = null;
            if (my_media == null) {
                // Creates Media object from srcm
                my_media = new Media(srcm, onSuccess, onError);
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

	$("#start-record").click(function(){
		$("#start-record").hide();
		$("#stop-record").show();
		$("#play-button").hide();
		recordAudio();
	});
  
	$("#record-button").click(function(){
		$("#stop-record").hide();
		stopRec();
		$("#play-button").show();
		$("#start-record").show();
	});
  
	$("#play-button").click(function(){
		playAudio();
	});

});