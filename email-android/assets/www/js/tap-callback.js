$(document).ready(function(){
	
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
});
