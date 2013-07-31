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
