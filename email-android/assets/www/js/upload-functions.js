function uploadWin(r){
	alert("in uploadWin" + r.response)
}

function uploadFail(error){
	alert("Upload Failed: " + error.code)
}

function uploadFile(fileURI){
	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
	options.mimeType = "text/plain";

	var params = {};
	params.value1 = "test";
	params.value2 = "param";

	options.params = params;

	var ft = new FileTransfer();
	ft.upload(fileURI, encodeURI("http://localhost:3000/api/upload"), uploadWin, uploadFail, options)
}