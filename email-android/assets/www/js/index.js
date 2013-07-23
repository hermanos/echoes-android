function startupWin(result) {
    if (result == TTS.STARTED) {
        window.plugins.tts.speak("echoes");
    }
}
function ChangeLanguageWin(result) {
    window.plugins.tts.speak("bongiorno italia");
}
function fail(result) {
    alert("TTS Startup failure = " + result);
}

function closeSplash(){
	navigator.splashscreen.hide();
}

//0-splash, 1-tutorial1, 2-tutorial2, 3-tutorial3, 4-add email, 5-sync
//11-compose, 12-inbox, 13-sent, 14-trash, 15-archive, 16-settings
//20-reply all, 21-reply, 22-read message, 23-forward 

var currentMenu = 0;
var menus = ["splash" ,"tutorial page 1" ,"tutorial page 2" ,"tutorial page 3" ,"add email" ,"syncronization"];
menus[10]="send message";
menus[11]= "compose"; menus[12]="inbox"; menus[13]="sent"; menus[14]="trash"; menus[15]="archive";menus[16]="settings";
menus[19] = 'refresh';
menus[22] = 'read message';
var inbox_messages = [];
var inbox_current_message = -1;

$(document).ready(function(){

	// initialize TTS services
	window.plugins.tts.startup(startupWin, fail);
//    window.plugins.tts.setLanguage('it', ChangeLanguageWin, fail);
	
	// gestures handlers
	$("#events").swipe({
	  swipe:function(event, direction, distance, duration, fingerCount) {
		  if (direction == 'left'){
			  if(currentMenu < 5){
			  	currentMenu += 1;
			  	if (currentMenu > 5) currentMenu = 5;
			  }
			  if(currentMenu> 10 && currentMenu < 16){
				  currentMenu += 1;
				  if (currentMenu > 16) currentMenu = 16; 
			  }
			  
		  }

		  if (direction == 'right'){
			  if(currentMenu <6){
			  	currentMenu -= 1;
			  	if (currentMenu < 0) currentMenu = 0;
		  	  }
			  if(currentMenu> 10 && currentMenu < 17){
				  currentMenu -= 1;
				  if (currentMenu < 11) currentMenu = 11;
			  }
		  }
		  
		  if (direction == 'down'){
			  if(currentMenu == 0)
				  currentMenu = 12;
			  if(currentMenu == 12){
			  	inbox_current_message += 1;
			  	if (inbox_current_message >= inbox_messages.length) inbox_current_message = inbox_messages.length - 1;
			  }
		  }
		  
		  if (direction == 'up'){
			  inbox_current_message -= 1;
			  if (inbox_current_message < 0) inbox_current_message = 0;
		  }
		  
		  afterMenuSelect();
	  },
	  longTap:function(event, target) {
			  refreshMessages('inbox');
	  },
	  tap:function(event, target) {
		  // detect language
//		  $.ajax({
//	            type: "GET",
//	            url: 'http://ws.detectlanguage.com/0.2/detect', 
//	            dataType: 'json',
//	            data: {
//	            	q: encodeURIComponent(inbox_messages[inbox_current_message].subject + ' ' + inbox_messages[inbox_current_message].content),
//	            	key: '54eead2bd73d8072e015059bf234b645'
//	            },
//	            success: function(response){
//	        		window.plugins.tts.speak('language: ' + response.data.detections[0].language);
//		  			// aici trebuie echivalata limba detectata cu una din familiile suportate de android
//	        		window.plugins.tts.setLanguage(response.data.detections[0].language, ChangeLanguageWin, fail);
//	            },
//	            error: function(error) {
////	            	window.plugins.tts.speak('error: ' + error.statusText);
//	            }
//	        });		
		  
			  window.plugins.tts.speak("From:" + inbox_messages[inbox_current_message].from);
			  window.plugins.tts.speak("To:" + inbox_messages[inbox_current_message].to);
			  window.plugins.tts.speak("Subject:" + inbox_messages[inbox_current_message].subject);
			  window.plugins.tts.speak("Content:" + inbox_messages[inbox_current_message].content);
		  
	  }
	});
	
	function afterMenuSelect(){
		window.plugins.tts.speak(menus[currentMenu]);

		if (currentMenu == 12 && inbox_messages.length > 0){
			window.plugins.tts.speak('' + inbox_messages.length + ' messages. message ' + inbox_current_message);
			window.plugins.tts.speak(inbox_messages[inbox_current_message].subject);
		}
		
		if (currentMenu == 19){ 
			currentMenu = 12;
			afterMenuSelect();
		}

		if (currentMenu == 22){
			currentMenu = 12;
			afterMenuSelect();
		}

	}
	
	// retrieve messages	
	function refreshMessages(folder){
		current_user_id = 1;
		window.plugins.tts.speak('refreshing messages');
		
		$.ajax({
            type: "GET",
            url: 'http://staging.echoesapp.com/messages.json',
            dataType: 'json',
            data: {
            	current_user: current_user_id
            },
            success: function(response){
            	inbox_messages = [];
            	response.forEach(function(element, index, array) {
            		inbox_messages.push(element);
            	});
        		window.plugins.tts.speak('' + inbox_messages.length + ' messages');
            },
            error: function(error) {
            	window.plugins.tts.speak('error: ' + error.statusText);
            }
        });		
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


});