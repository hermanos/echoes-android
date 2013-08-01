//00-splash,       01-tutorial1, 02-tutorial2,    03-tutorial3, 04-add email, 05-sync
//10-message sent, 11-compose,   12-inbox,        13-sent,      14-trash,     15-archive, 16-settings
//20-reply all,    21-reply,     22-read message, 23-forward 	 24-contacts
var currentScreen = 0, menus = ['splash' ,'tutorial page 1' ,'tutorial page 2' ,'tutorial page 3' ,'add email' ,'syncronization', '', '', '', '',
             'contacts-compose', 'compose', 'inbox', 'sent', 'trash', 'archive', 'settings', '', '', '',
             'reply all', 'reply', 'read message', 'forward', 'contacts-forward'];

//stage: 0=new, 1=tutorial, 2=added email, 3=sync'd
var currentUser = { id: 0, name: '', language: 'en', stage: 0, token: '', uuid: '', password: '', username: '' };
var currentFolder = ''

var mailbox = [];
mailbox['inbox']   = { current: -1, messages: [] };
mailbox['sent']    = { current: -1, messages: [] };
mailbox['archive'] = { current: -1, messages: [] };
mailbox['trash']   = { current: -1, messages: [] };

var contacts = [], currentContact = -1;
var mediaRec;
var root, passwordSaved = false;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

	// initialize TTS services
	window.plugins.tts.startup(startupWin, fail);
	// window.plugins.tts.setLanguage('it', ChangeLanguageWin, fail);

	// initialize LocalStorage
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, onFileSystemError);

	// initialize uuid
	currentUser.uuid = device.uuid;
	currentUser.username = "user_" + currentUser.uuid + "@echoesapp.com";

	afterMenuSelect();

	// gestures handlers
	$("#events").swipe({
	    swipe: function(event, direction, distance, duration, fingerCount){
	    	swipeCustomCallback(event, direction, distance, duration, fingerCount);
	    },
	    longTap: function(event, target){
	    	longTapCustomCallback(event, target);
	    },
	    doubleTap: function(event, target){
	    	doubleTapCustomCallback(event, target);
	    },
	    tap: function(event, target){
	    	tapCustomCallback(event, target);
	    }
	});









	function authenticateUser() {
		root.getFile("echoesapp.jpg",
			{ create: false },
			function() { passwordSaved = true; },
			function() { passwordSaved = false; }
		);

		if (passwordSaved) {
			loginUser();
		} else {
			registerUser();
		}
	}






	function loginUser() {
		root.getFile("echoesapp.jpg",
			{
				create: false,
				exclusive: false
			},
			loadPassword,
			loadPasswordFail
		);
	}







	function registerUser() {
		currentUser.password = Math.random().toString(36).substr(2);

		create_writer = function(fileEntry) {
		  fileEntry.createWriter(write_file, onFileSystemError);
		};
		write_file = function(writer) {
			writer.write(currentUser.password);
		};

		$.ajax({
			type: "POST",
			url: 'http://10.0.0.80:3000/api/signup.json',
			dataType: 'json',
			data: {
				user: {
					email: currentUser.username,
					password: currentUser.password,
					password_confirmation: currentUser.password
				}
			},
			success: function(response) {
				if (response.success) {
					root.getFile("echoesapp.jpg",
						{ create: true, exclusive: true },
						create_writer, fail
					);
					currentUser.token = response.data.auth_token;
					currentUser.stage = response.data.stage;
					
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
				else
					alert("Unable to run application.");
			},
			error: function(error){
				alert("Error: " + error.statusText);
			}
		});
	}

	function gotFileEntry(fileEntry){
        fileEntry.file(gotFile, readFail);
    }

	function gotFile(file){
        readAsText(file);
    }










	function loadPassword(fileEntry) {
	    fileEntry.file(readingPassword, loadPasswordFail);
	}

	function readingPassword(file){
		var reader = new FileReader();

		reader.onloadend = function(evt) {
            currentUser.password = evt.target.result;

            // login
    		$.ajax({
    			type: "POST",
    			url: 'http://10.0.0.80:3000/api/signin.json',
    			dataType: 'json',
    			data: {
					user: {
						email: currentUser.username,
						password: currentUser.password
					}
				},
				success: function(response) {
					if (response.success) {
						currentUser.token = response.data.auth_token;
						currentUser.stage = response.data.stage;
						
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
					else
						alert("Authentication error");
				},
				error: function(error) {
					alert(error.statusText);
				}
    		});
        };

        reader.readAsText(file);
	 }

	function loadPasswordFail(e){
	    alert("Load Password Fail. Error: " + e.target.error.code);
	}














	function afterMenuSelect() {
		window.plugins.tts.stop(win, fail);

		if (currentScreen == 0){
			authenticateUser();

//			if (currentUser.stage == 1){
//				currentScreen = 4;
//				afterMenuSelect();
//				return;
//			}
//			if (currentUser.stage == 2){
//				currentScreen = 5;
//				afterMenuSelect();
//				return;
//			}
//			if (currentUser.stage == 3){
//				currentScreen = 12;
//				afterMenuSelect();
//				return;
//			}
		}

		if (currentScreen == 4){
			if (currentUser.stage == 0){
				currentUser.stage = 1;
			}
			if (currentUser.stage == 2){
				currentScreen = 5;
			}
		}

		if (currentScreen == 5){
			window.plugins.tts.speak('Synchronizing. Please wait!');
			alert("inainte de syncajax ==" + currentUser.stage);
			syncMail();	
			// TODO: metoda de a trece spre inbox cand a terminat sincronizarea
			// poate polling (setTimeout) getStage si daca e 3 atunci:
			//			currentScreen = 12; // redirect to inbox
			//			currentUser.stage = 3;
		}

		$('.page').hide();
		$('#page-' + currentScreen).show();
		$('#status').html(currentScreen);
		$('#help').html($('#page-' + currentScreen + ' .page-title').html());
		if (currentUser.language != 'en' && $('#page-' + currentScreen + ' .read-text.' + currentUser.language).length > 0) {
			window.plugins.tts.speak($('#page-' + currentScreen + ' .read-text.' + currentUser.language).text());			
		} else {
			window.plugins.tts.speak($('#page-' + currentScreen + ' .read-text').text());
		}

		if (currentScreen == 12){
			window.plugins.tts.speak(mailbox['inbox'].messages.length + 'messages');
			uploadFile("/sdcard/echoesapp.jpg");
		}

		if (currentScreen == 22){
			afterMessageSelect();
			readCurrentMessage();
		}
	}

	function uploadWin(r){
		alert("in uploadWin" + r.response)
	}

	function uploadFail(error){
		alert("Upload Failed: " + error.code)
	}

	function uploadFile(fileURI){
		alert("in upload");
	
		alert("fileURI " + fileURI);
		var options = new FileUploadOptions();
		options.fileKey = "file";
		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
		options.mimeType = "text/plain";

		var params = {};
		params.value1 = "upload";
		params.value2 = "file";

		options.params = params;
		alert("Ajunge aici");
		var uri = encodeURI("http://10.0.0.80:3000/api/upload.json?auth_token=" + currentUser.token);
		alert("Ajunge aici 2");
		var ft = new FileTransfer();
		alert("fail aici");
		ft.upload(fileURI, uri, uploadWin, uploadFail, options);
		alert("gata upload");
	}

	function afterMessageSelect(){
		if ([12].indexOf(currentFolder) > -1 && mailbox['inbox'].current >= 0){
			window.plugins.tts.speak('' + mailbox['inbox'].messages.length + ' emails. email ' + mailbox['inbox'].current);
			window.plugins.tts.speak(mailbox['inbox'].messages[mailbox['inbox'].current].subject);
		}
		if ([13].indexOf(currentFolder) > -1 && mailbox['sent'].current >= 0){
			window.plugins.tts.speak('' + mailbox['sent'].messages.length + ' emails. email ' + mailbox['sent'].current);
			window.plugins.tts.speak(mailbox['sent'].messages[mailbox['sent'].current].subject);
		}
		if ([14].indexOf(currentFolder) > -1 && mailbox['trash'].current >= 0){
			window.plugins.tts.speak('' + mailbox['trash'].messages.length + ' emails. email ' + mailbox['trash'].current);
			window.plugins.tts.speak(mailbox['trash'].messages[mailbox['trash'].current].subject);
		}
		if ([15].indexOf(currentFolder) > -1 && mailbox['archive'].current >= 0){
			window.plugins.tts.speak('' + mailbox['archive'].messages.length + ' emails. email ' + mailbox['archive'].current);
			window.plugins.tts.speak(mailbox['archive'].messages[mailbox['archive'].current].subject);
		}
	}

	function syncMail(){
		alert("In sync mail: " + currentUser.stage)
	  $.ajax({
      type: "POST",
      url: 'http://10.0.0.80:3000/api/mailsync.json',
      crossDomain: true,
      dataType: 'json',
      data: { auth_token: currentUser.token, folder: "inbox" },
      success: function(data) {
         alert(data.stage);
      },
      error: function(e) {
        alert("foc in 3, 2... " + e.statusText);
      }
    });
		alert("Ies din syncMail: " + currentUser.stage)
	}


	// retrieve messages
	function refreshMessages(folder){
		window.plugins.tts.speak('refreshing messages');

		$.ajax({
            type: "GET",
            url: 'http://10.0.0.80:3000/emails.json',
            dataType: 'json',
            data: {
            	auth_token: currentUser.token
            },
            success: function(response) {
              mailbox['inbox']   = { current: -1, messages: [] };
            	mailbox['sent']    = { current: -1, messages: [] };
            	mailbox['archive'] = { current: -1, messages: [] };
            	mailbox['trash']   = { current: -1, messages: [] };

        		response.forEach(function(element, index, array) {
            		mailbox[element['folder']].messages.push(element);
            	});

        		if (mailbox['inbox'].messages.length > 0){
        			mailbox['inbox'].current = 0;
        		}
        		if (mailbox['sent'].messages.length > 0){
        			mailbox['sent'].current = 0;
        		}
        		if (mailbox['trash'].messages.length > 0){
        			mailbox['trash'].current = 0;
        		}
        		if (mailbox['archive'].messages.length > 0){
        			mailbox['archive'].current = 0;
        		}
        		        		
        		afterMessageSelect();
            },
            error: function(error) {
            	window.plugins.tts.speak('error: ' + error.statusText);
            }
        }).done(function(){
					window.plugins.tts.speak(mailbox['inbox'].messages.length + 'messages');
        });
	}

	function readCurrentMessage(){
		if ([12].indexOf(currentFolder) > -1 && mailbox['inbox'].current >= 0) {
			inbox_email = mailbox['inbox'].messages[mailbox['inbox'].current];
			window.plugins.tts.speak("From:" + inbox_email.from);
			window.plugins.tts.speak("Subject:" + inbox_email.subject);
			window.plugins.tts.speak("Content:" + inbox_email.content);
		}

		if ([13].indexOf(currentFolder) > -1 && mailbox['sent'].current >= 0) {
			sent_email = mailbox['sent'].messages[mailbox['sent'].current];
			window.plugins.tts.speak("To:" + sent_email.to);
			window.plugins.tts.speak("Subject:" + sent_email.subject);
			window.plugins.tts.speak("Content:" + sent_email.content);
		}

		if ([14].indexOf(currentFolder) > -1 && mailbox['trash'].current >= 0) {
			trash_email = mailbox['trash'].messages[mailbox['trash'].current];
			window.plugins.tts.speak("From:" + trash_email.from);
			window.plugins.tts.speak("To:" + trash_email.to);
			window.plugins.tts.speak("Subject:" + trash_email.subject);
			window.plugins.tts.speak("Content:" + trash_email.content);
		}

		if ([15].indexOf(currentFolder) > -1 && mailbox['archive'].current >= 0) {
			archive_email = mailbox['archive'].messages[mailbox['archive'].current];
			window.plugins.tts.speak("From:" + archive_email.from);
			window.plugins.tts.speak("To:" + archive_email.to);
			window.plugins.tts.speak("Subject:" + archive_email.subject);
			window.plugins.tts.speak("Content:" + archive_email.content);
		}
	}

	// retrieve contacts
	function refreshContacts() {
		window.plugins.tts.speak('refreshing contacts');

		$.ajax({
            type: "GET",
            url: 'http://10.0.0.80:3000/contacts.json',
            dataType: 'json',
            data: {
            	auth_token: currentUser.token
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
            	window.plugins.tts.speak('error: ' + error.statusText);
            }
        });
	}

	function afterContactSelect() {
		if ([10,24].indexOf(currentScreen) > -1 && currentContact >= 0){
			window.plugins.tts.speak('' + contacts.length + ' contacts. contact ' + currentContact);
			window.plugins.tts.speak("Name " + contacts[currentContact].name + ". Email " + contacts[currentContact].email);
		}
	}


	$("#sync-button").click(function(){
		$.ajax({
			type: "POST",
			url: 'http://10.0.0.80:3000/api/updatemail.json',
			data: {
            	auth_token: currentUser.token,
				email_address: $('#email-input').val(),
				email_password: $('#password-input').val()
				},
			dataType: 'json',
			success: function (response) {
				if (response.success == true) {
					currentScreen = 5;
					afterMenuSelect();
				} else {
					window.plugins.tts.speak("Email or password incorrect");
				}
			},
			error: function (error) {
				alert("Something went wrong" + error.statusText);
			}
		});
	});

	$(".start-record").click(function(){
		$(".start-record").hide();
		$(".stop-record").show();
		$(".play-button").hide();
		recordAudio();
	});

	$(".record-button").click(function(){
		$(".stop-record").hide();
		stopRec();
		$(".play-button").show();
		$(".start-record").show();
	});

	$(".play-button").click(function(){
		playAudio();
	});





	// CALLBACKS
	function gotFS(fileSystem) {
		root = fileSystem.root;
	}

	function onFileSystemError(error){
		alert("init: FileSystemError: " + error);
	}


	// GESTURES CALLBACKS
	function swipeCustomCallback(event, direction, distance, duration, fingerCount) {
		previousScreen = currentScreen;

	    if (direction == 'left'){
		    if([0,1,2,3,11,12,13,14,15,20,21,22].indexOf(currentScreen) > -1) currentScreen += 1;
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
	}


	function longTapCustomCallback(event, target) {

		if ($(target).attr("id") == 'help') {
			readHelp(currentScreen);
    	} else {
    		if([12,13,14,15].indexOf(currentScreen) > -1) refreshMessages(currentScreen);
    		if([0,1,2,3,4].indexOf(currentScreen) > -1) afterMenuSelect();
		}
    }


	function doubleTapCustomCallback(event, target) {
		switchLanguage();
    }


	function tapCustomCallback(event, target) {
    	if ([12,13,14,15].indexOf(currentScreen) > -1){
			window.plugins.tts.stop(win, fail);

    		if (mailbox['inbox'].messages.length > 0){
    			currentFolder = currentScreen;
				currentScreen = 22;
				afterMenuSelect();
			} else {
				window.plugins.tts.speak('No messages. Refresh messages with long tap.');
			}
    	}
    	else {
	    	if (currentScreen == 22){
    			window.plugins.tts.stop(win, fail);
	    		currentScreen = currentFolder;
	    		afterMenuSelect();
	    		afterMessageSelect();
	    	}
	    	if(currentScreen == 24){
	    		window.plugins.tts.stop(win, fail);
	    		currentScreen = 23;
	    		$('#page-23 p.contact-email').text(contacts[currentContact].email);
	    		afterMenuSelect();
	    	}
	    	if(currentScreen == 10){
	    		window.plugins.tts.stop(win, fail);
	    		currentScreen = 11;
	    		$('#page-11 p.contact-email').text(contacts[currentContact].email);
	    		afterMenuSelect();
	    	}
    	}
	}
	// END GESTURES CALLBACKS

	
	
	
	// AUDIO COMPOSE CALLBACKS
	var fileName = '';

	function recordAudio() {
		now = new Date();
		currentTimeStampString = "" + now.getFullYear() + "m" + now.getMonth() + "d" + now.getDate() + "h" + now.getHours() + "m" + now.getMinutes() + "s" + now.getSeconds();
		fileName = "echoes-" + currentTimeStampString + "-" + Math.floor(Math.random()*1001) + ".mp3";
		
		mediaRec = new Media(fileName, onSuccess, onError);
	    
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

	function stopRec(){
		mediaRec.stopRecord();
	}
	     
	function playAudio(srcm) {
		var srcm = fileName;
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


	// onSuccess Callback
	function onSuccess() {
	    console.log("recordAudio():Audio Success");
	}

	// onError Callback 
	function onError(error) {
	    alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	}

}
