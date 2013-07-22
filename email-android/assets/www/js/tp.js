    function onLoad() {
        document.addEventListener("deviceready", onDeviceReady, false);
    }
    
    function onDeviceReady() {
        window.plugins.tts.startup(startupWin, fail);
    }
    
    function startupWin(result) {
        if (result == TTS.STARTED) {
            window.plugins.tts.getLanguage(win, fail);
            window.plugins.tts.setLanguage('es', win, fail);
            window.plugins.tts.speak(document.getElementById('header').innerHTML);
        }
    }
    
    function win(result) {
        console.log(result);
    }
    
    function fail(result) {
        console.log("Error = " + result);
    }

    function speak(readThis) {
        var getContent = document.getElementById(readThis);
        if( getContent.innerHTML.length != 0)
           {
            // window.alert(getContent.innerHTML);
            window.plugins.tts.speak(getContent.innerHTML);
           }
        else 
            {
              // window.alert(getContent.value);
              window.plugins.tts.speak(getContent.value);
            }
    }