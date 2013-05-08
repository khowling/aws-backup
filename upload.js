
var AWS = require('aws-sdk-js');
AWS.config.loadFromPath('./config.json');
// Set your region for future requests.
AWS.config.update({region: 'us-east-1'});


var fs = require('fs');
// https://github.com/Picturelife/treehash
var treehash = require('treehash');

var glacier = new AWS.Glacier(),
    fname = process.argv[2],
    vaultName = 'hstore',
    bufsize = 2 * 1024 * 1024;  // 2Mb chunks


var stat = fs.statSync(fname),
    numchunks = Math.ceil(stat.size/bufsize);

console.log ('fs stat: ' + stat.size + ', cal chunks:' + numchunks);
var startbytes = 0, startTime = new Date();
var buffer = new Buffer(0);
var gchunks = 0, gtotsize = 0;

var thStream = treehash.createTreeHashStream ();

console.log('Initiating upload to' + vaultName + ', partSize: ' + bufsize.toString());
///* 
glacier.client.initiateMultipartUpload({vaultName: vaultName, archiveDescription: fname, partSize: bufsize.toString()}, function (mpErr, multipart) {

	 if (mpErr) { console.log('Error!', mpErr.stack); return; }
         console.log("Got upload ID", multipart.uploadId);
//*/

	  var finishit = function () {
///*
	    glacier.client.completeMultipartUpload({
		vaultName: vaultName,
		uploadId: multipart.uploadId,
		archiveSize: gtotsize.toString(),
		checksum: thStream.digest() // the computed tree hash
	      }, function(err, data) {
		if (err) {
		  console.log("An error occurred while uploading the archive");
		  console.log(err);
		} else {
//*/
		  var delta = (new Date() - startTime) / 1000;
		  console.log('Completed upload in', delta, 'seconds');
		  console.log('Archive ID:', data.archiveId);
		  console.log('location URI:', data.location);
		  console.log('Checksum:  ', data.checksum);
///*
		}
	    });
//*/
	  };

	var fileStream = fs.createReadStream(fname , {bufferSize: bufsize });
	process.stdout.write(buffer.length+'/'+bufsize+' progress: '+gchunks+'/'+numchunks+'\r');


	fileStream.on('data', function(chunk) {
	//  ALWAYS RETURNS chuncks in sizes of '40960', so accumilate
	    fileStream.pause();

	    buffer = Buffer.concat ([buffer, chunk]);
	    process.stdout.write(buffer.length+'/'+bufsize+' progress: '+gchunks+'/'+numchunks+'\r');

	    if (buffer.length >= bufsize) {

		var sendit = buffer.slice (0, bufsize)
		var range = 'bytes ' + (gchunks*bufsize) + '-' +  ((gchunks*bufsize)+sendit.length-1) + '/*';
		process.stdout.write('\nsend: '+sendit.length + ', '+ range +'\n');

		gchunks++, gtotsize+= sendit.length;
		buffer = buffer.slice (bufsize, buffer.length);
		process.stdout.write('remain: '+buffer.length+'/'+bufsize+' progress: '+gchunks+'/'+numchunks+'\n');

		thStream.update(sendit);
///*
                glacier.client.uploadMultipartPart( {
		  vaultName: vaultName,
		  uploadId: multipart.uploadId,
		  range: range,
		  body: sendit },  
		 	function(err, data) {
				if (err) {
				  console.log("An error occurred while uploading the archive");
				  console.log(err);
				}	

//*/
				fileStream.resume();
///*
			});
//*/
	    } else {
		fileStream.resume();
	    }
	});

	fileStream.on('end', function (){
	    if (buffer.length >0) {

		var range = 'bytes ' + (gchunks*bufsize) + '-' +  ((gchunks*bufsize)+buffer.length-1) + '/*';
		gchunks++, gtotsize+= buffer.length;
		process.stdout.write('\nsend: '+buffer.length + ', '+ range +' progress: '+gchunks+'/'+numchunks+'\n');


		thStream.update(buffer);
///*
		glacier.client.uploadMultipartPart( {
		  vaultName: vaultName,
		  uploadId: multipart.uploadId,
		  range: range,
		  body: buffer },  
		 	function(err, data) {
				if (err) {
				  console.log("An error occurred while uploading the archive");
				  console.log(err);
				}	
//*/
				finishit();
///*
			});
//*/

	    } else {
		finishit();
	    }

	//    console.log('len: ' + gtotsize + ', #chunks: ' + gchunks);
	});
///*
});
//*/
