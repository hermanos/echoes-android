function startupWin(result) {
    if (result == TTS.STARTED) {
    	window.plugins.tts.getLanguage(win, fail);
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

var languages = [];
languages['en'] = 'Switching to CNN';
languages['it'] = 'Bongiorno Italia';
languages['fr'] = 'Parlez-vous francais?';
languages['es'] = 'Cento pessos';


function changeLanguage(language) {
	window.plugins.tts.isLanguageAvailable(language, function(){
		window.plugins.tts.stop(win, fail);
    	window.plugins.tts.setLanguage(language);
		window.plugins.tts.speak(languages[language]);
    	currentUser.language = language;
    },fail);
}