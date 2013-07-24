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
//20-reply all, 21-reply,     22-read message, 23-forward 

var currentScreen = 0;
var menus = ['splash' ,'tutorial page 1' ,'tutorial page 2' ,'tutorial page 3' ,'add email' ,'syncronization', '', '', '', '', 
             '', 'compose', 'inbox', 'sent', 'trash', 'archive', 'settings', '', '', '', 
             'reply all', 'reply', 'read message', 'forward'];

var inbox_messages = [];
var inbox_current_message = -1;
var currentMessage = null;

// stage: 0=new, 1=tutorial, 2=added email, 3=sync'd
var currentUser = { id: 1, name: 'Barrack Obama', language: 'en', stage: 0 };

$(document).ready(function(){

	// initialize TTS services
	window.plugins.tts.startup(startupWin, fail);
	// window.plugins.tts.setLanguage('it', ChangeLanguageWin, fail);
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
    			if ([12,13,14,15].indexOf(currentScreen) > -1 && inbox_current_message >= 0){
    				inbox_current_message += 1;
    				window.plugins.tts.stop(win, fail);
			  	  	if (inbox_current_message >= inbox_messages.length) inbox_current_message = inbox_messages.length - 1;
			  	  	afterMessageSelect();
    			}
    		}
		  
    		if (direction == 'up'){
    			if ([12,13,14,15].indexOf(currentScreen) > -1 && inbox_current_message >= 0){
    				inbox_current_message -= 1;
    				window.plugins.tts.stop(win, fail);
    				if (inbox_current_message < 0) inbox_current_message = 0;
    				afterMessageSelect();
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

	    		if (inbox_messages.length > 0){
					currentScreen = 22;
					currentMessage = inbox_messages[inbox_current_message];
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
	    	}
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
		if ([12,13,14,15].indexOf(currentScreen) > -1 && inbox_current_message >= 0){
			currentMessage = inbox_messages[inbox_current_message];
			window.plugins.tts.speak('' + inbox_messages.length + ' messages. message ' + inbox_current_message);
			window.plugins.tts.speak(inbox_messages[inbox_current_message].subject);
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
            	inbox_messages = [];
            	response.forEach(function(element, index, array) {
            		inbox_messages.push(element);
            	});
        		if (inbox_messages.length > 0){
        			inbox_current_message = 0;
                	afterMessageSelect();
        		} else {
        			inbox_current_message = -1;
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

	  // detect language
//	  $.ajax({
//          type: "GET",
//          url: 'http://ws.detectlanguage.com/0.2/detect', 
//          dataType: 'json',
//          data: {
//          	q: encodeURIComponent(inbox_messages[inbox_current_message].subject + ' ' + inbox_messages[inbox_current_message].content),
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