function startupWin(result) {
    if (result == TTS.STARTED) {
    	window.plugins.tts.getLanguage(win, fail);
        window.plugins.tts.speak("Echoes!");
        
//        window.plugins.tts.isLanguageAvailable("en_US", function() {
//            addLang("en_US", "English (American)");
//        }, fail);
//        
//        window.plugins.tts.isLanguageAvailable("it", function() {
//            addLang("it", "Italian");
//        }, fail);
       
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
