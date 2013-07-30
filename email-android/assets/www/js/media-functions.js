var fileName = '';

function recordAudio() {
	currentTimeStamp = new Date();
	currentTimeStampString = "" + currentTimeStamp.getFullYear() + "m" + currentTimeStamp.getMonth() + "d" + currentTimeStamp.getDate() + "h" + currentTimeStamp.getHours() + "m" + currentTimeStamp.getMinutes() + "s" + currentTimeStamp.getSeconds();
	fileName = "echoes-" + currentTimeStampString + "-" + Math.floor(Math.random()*1001) + ".mp3";
	
	mediaRec = new Media(fileName, onSuccess, onError);
    
    // Record audio begins here
    mediaRec.startRecord();
	
    // Stops recording after 30 sec (default if stopRec is not called)
    var recTime = 0;
    var recInterval = setInterval(function() {
        recTime = recTime + 1;
        if (recTime >= 30) {
            clearInterval(recInterval);
            mediaRec.stopRecord();
        } 
    }, 1000);
}

function stopRec(){
	mediaRec.stopRecord();
}
     
function playAudio(srcm) {
	var srcm = fileName;
	var my_media = null;
	var mediaTimer = null;
    
	if (my_media == null) {
        // Creates Media object from srcm
        my_media = new Media(srcm, onSuccess, onError);
    } // else play current audio
    	
	// Play audio
	my_media.play();

    // Update my_media position every second
    if (mediaTimer == null) {
        mediaTimer = setInterval(function() {
            // get my_media position
            my_media.getCurrentPosition(
                // success callback
                function(position) {
                    if (position > -1) {
                        setAudioPosition((position) + " sec");
                    }
                },
                // error callback
                function(e) {
                    console.log("Error getting pos=" + e);
                    setAudioPosition("Error: " + e);
                }
            );
        }, 1000);
    }
}


// onSuccess Callback
function onSuccess() {
    console.log("recordAudio():Audio Success");
}

// onError Callback 
function onError(error) {
    alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}
