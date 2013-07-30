//00-splash,    01-tutorial1, 02-tutorial2,    03-tutorial3, 04-add email, 05-sync
//              11-compose,   12-inbox,        13-sent,      14-trash,     15-archive, 16-settings
//20-reply all, 21-reply,     22-read message, 23-forward 	 24-contacts
var currentScreen = 0, menus = ['splash' ,'tutorial page 1' ,'tutorial page 2' ,'tutorial page 3' ,'add email' ,'syncronization', '', '', '', '',
             'contacts-compose', 'compose', 'inbox', 'sent', 'trash', 'archive', 'settings', '', '', '',
             'reply all', 'reply', 'read message', 'forward', 'contacts-forward'];

//stage: 0=new, 1=tutorial, 2=added email, 3=sync'd
var currentUser = { id: 0, name: '', language: 'en', stage: 0, token: '', uuid: '', password: '', username: '' };

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






	function loginUser(){
		root.getFile("echoesapp.jpg",
			{
				create: false,
				exclusive: false
			},
			loadPassword,
			loadPasswordFail
		);
	}







	function registerUser(){
		currentUser.password = Math.random().toString(36).substr(2);

		create_writer = function(fileEntry) {
		  fileEntry.createWriter(write_file, onFileSystemError);
		};
		write_file = function(writer) {
			writer.write(password);
		};

		alert("inainte de ajax");
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
					alert("Successfuly registered");

					root.getFile("echoesapp.jpg",
						{ create: true, exclusive: true },
						create_writer, fail
					);
					currentUser.token = response.data.auth_token;
					currentUser.stage = response.data.stage;
				}
				else
					alert("Unable to run application.");
			},
			error: function(error){
				alert("Error:" + error.statusText);
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
						alert(currentUser.token);
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














	function afterMenuSelect(){

		if (currentScreen == 0){
			authenticateUser();

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
			if (currentUser.stage == 0){
				currentUser.stage = 1;
			}
			if (currentUser.stage == 2){
				currentScreen = 5;
			}
		}

		if (currentScreen == 5){
			window.plugins.tts.speak('Synchronizing. Please wait!');
			// TODO: metoda de a trece spre inbox cand a terminat sincronizarea
			// poate polling (setTimeout) getStage si daca e 3 atunci:
			//			currentScreen = 12; // redirect to inbox
			//			currentUser.stage = 3;
		}

		$('.page').hide();
		$('#page-' + currentScreen).show();
		$('#status').html(currentScreen);
		$('#help').html($('#page-' + currentScreen + ' .page-title').html());
		window.plugins.tts.speak($('#page-' + currentScreen + ' .read-text').text());

		if (currentScreen == 22){
			afterMessageSelect();
			readCurrentMessage();
		}
	}

	function afterMessageSelect(){
		if ([12].indexOf(currentScreen) > -1 && mailbox['inbox'].current >= 0){
			window.plugins.tts.speak('' + mailbox['inbox'].messages.length + ' emails. email ' + mailbox['inbox'].current);
			window.plugins.tts.speak(mailbox['inbox'].messages[mailbox['inbox'].current].subject);
		}
		if ([13].indexOf(currentScreen) > -1 && mailbox['sent'].current >= 0){
			window.plugins.tts.speak('' + mailbox['sent'].messages.length + ' emails. email ' + mailbox['sent'].current);
			window.plugins.tts.speak(mailbox['sent'].messages[mailbox['sent'].current].subject);
		}
		if ([14].indexOf(currentScreen) > -1 && mailbox['trash'].current >= 0){
			window.plugins.tts.speak('' + mailbox['trash'].messages.length + ' emails. email ' + mailbox['trash'].current);
			window.plugins.tts.speak(mailbox['trash'].messages[mailbox['trash'].current].subject);
		}
		if ([15].indexOf(currentScreen) > -1 && mailbox['archive'].current >= 0){
			window.plugins.tts.speak('' + mailbox['archive'].messages.length + ' emails. email ' + mailbox['archive'].current);
			window.plugins.tts.speak(mailbox['archive'].messages[mailbox['archive'].current].subject);
		}
	}

	// retrieve messages
	function refreshMessages(folder){
		window.plugins.tts.speak('refreshing messages');

		$.ajax({
            type: "GET",
            // TODO: mesajele trebuie aduse din emails
            url: 'http://staging.echoesapp.com/emails.json',
            dataType: 'json',
            data: {
            	auth_token: currentUser.token
            },
            success: function(response){
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
        });
	}

	// TODO: a se seta un parametru (mesaj) pe functia asta
	function readCurrentMessage(){
		if ([12].indexOf(currentScreen) > -1 && mailbox['inbox'].current >= 0) {
			inbox_email=mailbox['inbox'].messages[mailbox['inbox'].current];
			window.plugins.tts.speak("From:" + inbox_email.from);
			window.plugins.tts.speak("Subject:" + inbox_email.subject);
			window.plugins.tts.speak("Content:" + inbox_email.content);
		}

		if ([13].indexOf(currentScreen) > -1 && mailbox['sent'].current >= 0) {
			sent_email=mailbox['sent'].messages[mailbox['sent'].current];
			window.plugins.tts.speak("To:" + sent_email.to);
			window.plugins.tts.speak("Subject:" + sent_email.subject);
			window.plugins.tts.speak("Content:" + sent_email.content);
		}

		if ([14].indexOf(currentScreen) > -1 && mailbox['trash'].current >= 0) {
			trash_email=mailbox['trash'].messages[mailbox['trash'].current];
			window.plugins.tts.speak("From:" + trash_email.from);
			window.plugins.tts.speak("To:" + trash_email.to);
			window.plugins.tts.speak("Subject:" + trash_email.subject);
			window.plugins.tts.speak("Content:" + trash_email.content);
		}

		if ([15].indexOf(currentScreen) > -1 && mailbox['archive'].current >= 0) {
			archive_email=mailbox['archive'].messages[mailbox['archive'].current];
			window.plugins.tts.speak("From:" + archive_email.from);
			window.plugins.tts.speak("To:" + archive_email.to);
			window.plugins.tts.speak("Subject:" + archive_email.subject);
			window.plugins.tts.speak("Content:" + archive_email.content);
		}
	}

	// retrieve contacts
	function refreshContacts(){
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
				email_address: $('#email-input').text(),
				email_password: $('#password-input').text()
				},
			dataType: 'json',
			success: function (response) {
				alert(response);
				if (response.success == true) {
					afterMenuSelect();
				} else {
					alert("Email or password incorrect");
					window.plugins.tts.speak("Email or password incorrect");
				}

			},
			error: function (error) {
				alert("Something went wrong");
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
			window.plugins.tts.speak('Help. ' + $('#page-' + currentScreen + ' .read-help').text());
    	} else {
    		if([12,13,14,15].indexOf(currentScreen) > -1) refreshMessages('');
    		if([0,1,2,3,4].indexOf(currentScreen) > -1) afterMenuSelect();
		}
    }


	function doubleTapCustomCallback(event, target) {
			if(currentUser.language == 'en'){
				 window.plugins.tts.isLanguageAvailable("it", function(){
		        	 window.plugins.tts.setLanguage("it");
		        },fail);
				window.plugins.tts.stop(win, fail);
				window.plugins.tts.speak("change language to italian");
			}
			if(currentUser.language== 'it'){
				 window.plugins.tts.isLanguageAvailable("en", function(){
					 window.plugins.tts.setLanguage("en");
		        },fail);
				window.plugins.tts.stop(win, fail);
				window.plugins.tts.speak("change language to english");
			}
		}
    }


	function tapCustomCallback(event, target) {
    	if ([12,13,14,15].indexOf(currentScreen) > -1){
			window.plugins.tts.stop(win, fail);

    		if (mailbox['inbox'].messages.length > 0){
				currentScreen = 22;
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

	function fail() {

	}

}
