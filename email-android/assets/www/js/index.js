//00-splash,    01-tutorial1, 02-tutorial2,    03-tutorial3, 04-add email, 05-sync
//              11-compose,   12-inbox,        13-sent,      14-trash,     15-archive, 16-settings
//20-reply all, 21-reply,     22-read message, 23-forward 	 24-contacts
var currentScreen = 0, menus = ['splash' ,'tutorial page 1' ,'tutorial page 2' ,'tutorial page 3' ,'add email' ,'syncronization', '', '', '', '', 
             'contacts-compose', 'compose', 'inbox', 'sent', 'trash', 'archive', 'settings', '', '', '', 
             'reply all', 'reply', 'read message', 'forward', 'contacts-forward'];

//stage: 0=new, 1=tutorial, 2=added email, 3=sync'd
var currentUser = { id: 0, name: '', language: 'en', stage: 0, token: '' };

var mailbox = [];
mailbox['inbox']   = { current: -1, messages: [] };
mailbox['sent']    = { current: -1, messages: [] };
mailbox['archive'] = { current: -1, messages: [] };
mailbox['trash']   = { current: -1, messages: [] };

var contacts = [], currentContact = -1;
var mediaRec;

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	
	// initialize TTS services
	window.plugins.tts.startup(startupWin, fail);
	// window.plugins.tts.setLanguage('it', ChangeLanguageWin, fail);
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

	var getFileSystemRoot = function(){
		var root;

		var init = function(){
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
				root = fileSystem.root;
			}, onFileSystemError);
		};

		return function(){
			return root
		};
	};

	function onFileSystemError(error){
		alert("FileSystemError" + error);
	}

	function registerAccount(){
		var root = getFileSystemRoot();
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
								email: 'user_' + phone + '@echoesapp.com',
								password: password,
								password_confirmation: password
				}
			},
			success: function(response){
				if(response.success){
					alert("Successfuly registered");
					root.getFile("word", {create: true, exclusive: true}, create_writer, fail);	
				}
				else alert("Something failed horribly");
			},
			error: function(error){
				alert(error);
			}
		});
	}
	
	function afterMenuSelect(){

		if (currentScreen == 0){
			// TODO: login/register account and set currentUser variable, scris parola pe SD
			
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
				// TODO: save currentUser.stage = 1 (tutorial finished)
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
		window.plugins.tts.speak($('#page-' + currentScreen + ' .read-text').text());
		
		if (currentScreen == 22){
			afterMessageSelect();
			readCurrentMessage();
		}
	}

	// TODO: adaptarea functiei pentru toate folderele
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
            // TODO: mesajele trebuie aduse din emails
            url: 'http://staging.echoesapp.com/messages.json',
            dataType: 'json',
            data: {
            	// TODO: pentru toate apelurile ajax se va folosi TOKEN in loc de userid
            	current_user: currentUser.token
            },
            success: function(response){
            	// TODO: se aduc mesajele din toate folderele
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
	
	// TODO: a se seta un parametru (mesaj) pe functia asta
	function readCurrentMessage(){
		window.plugins.tts.speak("From:" + mailbox['inbox'].messages[mailbox['inbox'].current].from);
		window.plugins.tts.speak("To:" + mailbox['inbox'].messages[mailbox['inbox'].current].to);
		window.plugins.tts.speak("Subject:" + mailbox['inbox'].messages[mailbox['inbox'].current].subject);
		window.plugins.tts.speak("Content:" + mailbox['inbox'].messages[mailbox['inbox'].current].content);
	}
	
	// retrieve contacts	
	function refreshContacts(){
		window.plugins.tts.speak('refreshing contacts');
		
		$.ajax({
            type: "GET",
            url: 'http://staging.echoesapp.com/contacts.json',
            dataType: 'json',
            data: {
            	// TODO: pentru toate apelurile ajax se va folosi TOKEN in loc de userid
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
			headers:  {'Content-Type' : 'application/json'},
			data: {
				// TODO: aici se mai adauga un token
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
		window.plugins.tts.speak('double tap');
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

}
