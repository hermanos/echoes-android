// function uploadWin(r){
// 		alert("in uploadWin" + r.response)
// 	}

// 	function uploadFail(error){
// 		alert("Upload Failed: " + error.code)
// 	}

// 	function uploadFile(fileURI){
// 		var options = new FileUploadOptions();
// 		options.fileKey = "file";
// 		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
// 		options.mimeType = "text/plain";

// 		var params = {};
// 		params.value1 = "upload";
// 		params.value2 = "file";

// 		options.params = params;
// 		var uri = encodeURI("http://10.0.0.80:3000/api/upload.json?auth_token=" + currentUser.token);
// 		var ft = new FileTransfer();
// 		ft.upload(fileURI, uri, uploadWin, uploadFail, options);

// 	}