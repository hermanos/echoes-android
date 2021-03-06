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

mailbox['inbox'] = {
  current: -1,
  messages: []
};

mailbox['sent']    = { current: -1, messages: [] };
mailbox['archive'] = { current: -1, messages: [] };
mailbox['trash']   = { current: -1, messages: [] };

var fileName = '';
var contacts = [], currentContact = -1;
var mediaRec, mediaState;
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
	    swipe: swipeCustomCallback,
	    longTap: longTapCustomCallback,
	    doubleTap: doubleTapCustomCallback,
	    tap: tapCustomCallback
	});









	function authenticateUser() {
		root.getFile("echoesapp/echoesapp.jpg",
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
		root.getFile("echoesapp/echoesapp.jpg",
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
		console.log(root.fullPath);
		root.getDirectory("echoesapp", {create: true, exclusive: true}, win, fail);
		console.log("Dupa get directory");
		create_writer = function(fileEntry) {
		  fileEntry.createWriter(write_file, onFileSystemError);
		};
		write_file = function(writer) {
			writer.write(currentUser.password);
		};

		$.ajax({
			type: "POST",
			url: 'http://staging.echoesapp.com/api/signup.json',
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
					root.getFile("echoesapp/echoesapp.jpg",
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
					console.log("Unable to run application.");
			},
			error: function(error){
				console.log("Error: " + error.statusText);
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
    			url: 'http://staging.echoesapp.com/api/signin.json',
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
						console.log("Authentication error");
				},
				error: function(error) {
					console.log("Password reading" + error.statusText);
				}
    		});
        };

        reader.readAsText(file);
	 }

	function loadPasswordFail(e){
	    console.log("Load Password Fail. Error: " + e.target.error.code);
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
			syncMail('inbox');
			// TODO: metoda de a trece spre inbox cand a terminat sincronizarea
			// poate polling (setTimeout) getStage si daca e 3 atunci:
			//			currentScreen = 12; // redirect to inbox
			//			currentUser.stage = 3;
		}

		// if (currentScreen == 11){
		// 	window.plugins.tts.speak("Message Sent");
		// 	currentScreen = 12;
		// }

		$('.page').hide();
		$('#page-' + currentScreen).show();

		$('#help').html($('#page-' + currentScreen + ' .page-title').html());
		if (currentUser.language != 'en' && $('#page-' + currentScreen + ' .read-text.' + currentUser.language).length > 0) {
			window.plugins.tts.speak($('#page-' + currentScreen + ' .read-text.' + currentUser.language).text());
		} else {
			window.plugins.tts.speak($('#page-' + currentScreen + ' .read-text').text());
		}

		if (currentScreen == 12){
			window.plugins.tts.speak(mailbox['inbox'].messages.length + 'messages');
			// uploadFile("root.fullPath + /echoesapp/echoesapp.jpg");
		}

		if (currentScreen == 22){
			afterMessageSelect();
			readCurrentMessage();
		}

	}

	function sendMail(){
		$.ajax({
      type: "POST",
      url: 'http://staging.echoesapp.com/api/sendmail.json',
      crossDomain: true,
      dataType: 'json',
      data: { auth_token: currentUser.token, email: { to: $('p.contact-email').text(), subject: "email from " + currentUser.username,
      			  content: "Listen to the attachment.", language: "en", cc: null, bcc: null, attach: fileName.substr(fileName.lastIndexOf('/') + 1) } },
      success: function(data) {
          if(data.success)
              alert("send mail: " + data.folder);
          else
              alert("send mail: " + data.folder);
      },
      error: function(e) {
        alert("foc in 3, 2... " + e.statusText);
      }
    });
 	}

	function uploadWin(r){
		sendMail();
		console.log("in uploadWin" + r.response);
	}

	function uploadFail(error){
		console.log("Upload Failed: " + error.code);
	}

	function uploadFile(fileURI){
		alert(fileURI);
		var options = new FileUploadOptions();
		options.fileKey = "file";
		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
		options.mimeType = "audio/mp3";
		alert(options.fileName);
		options.chunckedMode = false;

		var uri = encodeURI("http://staging.echoesapp.com/api/upload.json?auth_token=" + currentUser.token);
		var ft = new FileTransfer();
		ft.upload(fileURI, uri, uploadWin, uploadFail, options);
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

	function syncMail(folder){
	  $.ajax({
      type: "POST",
      url: 'http://staging.echoesapp.com/api/mailsync.json',
      crossDomain: true,
      dataType: 'json',
      data: { auth_token: currentUser.token, folder: folder },
      beforeSend: function(){ window.plugins.tts.speak("Refreshing Messages") },
      success: function(data) {
      	console.log("Stage: " + data.stage);
      },
      error: function(e) {
        console.log("Error in sync: " + e.statusText);
      }
    }).done(function(){
    	refreshMessages(currentScreen);
    });
	}


	// retrieve messages
	function refreshMessages(folder){
		// window.plugins.tts.speak('refreshing messages');
		setTimeout(function(){
			clearTimeout();
			$.ajax({
	            type: "GET",
	            url: 'http://staging.echoesapp.com/emails.json',
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
		        				if(element.attachment != null){
		        				 	downloadAttachment(element.attachment);
		        				 }
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
	        })}, 1000);
	}

	function downloadAttachment(pFile){
		var filePath = root.fullPath + "/echoesapp/" + pFile;

		create_writer = function(fileEntry) {

		  fileEntry.createWriter(write_file, onFileSystemError);
		};
		write_file = function(writer) {
			writer.write(currentUser.password);
		};
		root.getFile("/echoesapp/" + pFile,
				{ create: true, exclusive: true },
				create_writer, fail
				);

		var fileTransfer = new FileTransfer();
		var uri = encodeURI("http://staging.echoesapp.com/api/download.json?auth_token=" + currentUser.token + "&filename=" + pFile);

		fileTransfer.download(uri, filePath, uploadWin, uploadFail);
	}

	function speakMessage(mail){
		window.plugins.tts.speak("From:" + mail.from);
		window.plugins.tts.speak("Subject:" + mail.subject);
		window.plugins.tts.speak("Content:" + mail.content);
	}

	function playAttachment(attachment){
		alert(root.fullPath + attachment)
		var my_media = null;
		var mediaTimer = null;

		if (my_media == null) {
      // Creates Media object from srcm
      my_media = new Media(root.fullPath + "/echoesapp/" + attachment, onSuccess, onError);
    } // else play current audio

		// Play audio
		my_media.play();

 		var playTime
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
	        playTime = playTime + 1;
	        if (playTime >=30 ) {
	        	clearInterval(mediaTimer);
	        	my_media.stop();
	        }
	    }, 1000);
    }
	}

	function readCurrentMessage(){
		if ([12].indexOf(currentFolder) > -1 && mailbox['inbox'].current >= 0) {
			inbox_email = mailbox['inbox'].messages[mailbox['inbox'].current];
			if(inbox_email.attachment != null){
				playAttachment(inbox_email.attachment);
			}	else {
				speakMessage(inbox_email);
			}
		}

		if ([13].indexOf(currentFolder) > -1 && mailbox['sent'].current >= 0) {
			sent_email = mailbox['sent'].messages[mailbox['sent'].current];
			if(inbox_email.attachment != null){
				playAttachment(sent_email.attachment);
			}	else {
				speakMessage(sent_email);
			}
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
            url: 'http://staging.echoesapp.com/contacts.json',
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
			url: 'http://staging.echoesapp.com/api/updatemail.json',
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
				console.log("Something went wrong" + error.statusText);
			}
		});
	});

	// $(".start-record").click(function(){
	// 	$(".start-record").hide();
	// 	$(".stop-record").show();
	// 	$(".play-button").hide();
	// 	recordAudio();
	// });

	// $(".record-button").click(function(){
	// 	$(".stop-record").hide();
	// 	stopRec();
	// 	$(".play-button").show();
	// 	$(".start-record").show();
	// });

	$(".play-button").click(function(){
		playAudio();
	});





	// CALLBACKS
	function gotFS(fileSystem) {
		root = fileSystem.root;
	}

	function onFileSystemError(error){
		console.log("init: FileSystemError: " + error);
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
			if(currentScreen == 11) uploadFile(fileName);
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
    		if([12,13,14,15].indexOf(currentScreen) > -1) syncMail(menus[currentScreen]);
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

	    	if(currentScreen == 11){
	    		if(mediaState == 1)
	    			stopRec();
	    		else {
	    			window.plugins.tts.speak("Start Recording", recordAudio());
	    		}
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

	function recordAudio() {
		now = new Date();
		currentTimeStampString = "" + now.getFullYear() + "m" + now.getMonth() + "d" + now.getDate() + "h" + now.getHours() + "m" + now.getMinutes() + "s" + now.getSeconds();
		fileName = root.fullPath + "/echoesapp/echoes-" + currentTimeStampString + "-" + Math.floor(Math.random()*1001) + ".mp3";

		mediaRec = new Media(fileName, onSuccess, onError);

	    // Record audio begins here
	    mediaRec.startRecord();
			mediaState = 1;
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
		window.plugins.tts.speak("Stop Recording");
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
	    console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	}

}
