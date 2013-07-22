function startupWin(result) {
    if (result == TTS.STARTED) {
        window.plugins.tts.speak("ecoz");
    }
}
function ChangeLanguageWin(result) {
    window.plugins.tts.speak("bongiorno italia");
}
function fail(result) {
    alert("TTS Startup failure = " + result);
}

$(document).ready(function(){

	// initialize TTS services
	window.plugins.tts.startup(startupWin, fail);
    window.plugins.tts.setLanguage('it', ChangeLanguageWin, fail);
	
	// gestures handlers
	$("#events").swipe({
	  swipe:function(event, direction, distance, duration, fingerCount) {
		  window.plugins.tts.speak("swipe " + direction);
	  }
	});
	
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

// 		retrieve messages	
//		current_user_id = 1;
//        $.ajax({
//            type: "GET",
//            url: 'http://staging.echoesapp.com/messages.json?current_user=' + current_user_id,
//            dataType: 'json',
//            data: {},
//            success: function(response){
//              messages = '';
//              response.forEach(function(element, index, array) {
//                messages += '<p data-id="' + element['id'] + '">From: ' + element['from'] + '<br>To: ' + element['to'] + '<br>Subject: ' + element['subject'] + '</p>';
//              });
//              $('div#index .content').html(messages);
//            },
//            error: function(error) {
//              alert(error.statusText);
//            }
//        });		

});