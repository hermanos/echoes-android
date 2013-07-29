$(document).ready(function(){
	
	function longTapCustomCallback(event, target) {
    	if ($(target).attr("id") == 'help') {
			window.plugins.tts.speak('Help. ' + $('#page-' + currentScreen + ' .read-help').text());
    	} else {
    		if([12,13,14,15].indexOf(currentScreen) > -1) refreshMessages('');
    		if([0,1,2,3,4].indexOf(currentScreen) > -1) afterMenuSelect();
		}
    }
});