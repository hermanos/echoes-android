$(document).ready(function(){
	
	function swipeCustomCallback(event, direction, distance, duration, fingerCount) {
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
	}
});