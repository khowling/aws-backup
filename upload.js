
var AWS = require('aws-sdk-js'),
    env = process.env;


AWS.config.update({accessKeyId: env.AWS_ACCESS_KEY, secretAccessKey: env.AWS_SECRET_KEY, region: env.AWS_REGION});

//AWS.config.loadFromPath('./config.json');
// Set your region for future requests.
//AWS.config.update({region: 'us-east-1'});


var fs = require('fs');
// https://github.com/Picturelife/treehash
var treehash = require('treehash');

var glacier = new AWS.Glacier(),
    fname = process.argv[2],
    vaultName = 'hstore',
    bufsize = 64 * 1024 * 1024;  // 62 Mb chunks


var stat = fs.statSync(fname),
    numchunks = Math.ceil(stat.size/bufsize);

console.log ('fs stat: ' + stat.size + ', cal chunks:' + numchunks);
var startbytes = 0, startTime = new Date();
var buffer = new Buffer(0);
var gchunks = 0, gtotsize = 0;

var thStream = treehash.createTreeHashStream ();

var opts = {vaultName: vaultName, archiveDescription: fname, partSize: bufsize.toString()};
console.log ('\n' + new Date().toUTCString() + ' : initiateMultipartUpload : ' + + JSON.stringify(opts));
///* 
glacier.client.initiateMultipartUpload(opts, function (mpErr, multipart) {

	if (mpErr) { 
		 console.log( new Date().toUTCString() + ' : initiateMultipartUpload error : ' + mpErr.stack);
		 return; 
   }
   console.log( new Date().toUTCString() + ' : initiateMultipartUpload uploadID : ' + multipart.uploadId);
//*/

//  var tempFile = fs.createWriteStream('test.out');


	var finishit = function () {
//			tempFile.end();
			var data = {};
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
					   console.log('Archive ID: ', data.archiveId);
					   console.log('Archive Name: ' + fname);
					   console.log('location URI: ', data.location);
					   console.log('Checksum: ', data.checksum);
///*
	          	}
	    });
//*/
	};

	process.stdout.write(buffer.length+'/'+bufsize+' progress: '+gchunks+'/'+numchunks+'\r');
	var fileStream = fs.createReadStream(fname , {bufferSize: bufsize });



  var chunkarray = [],
      chunksize = 0;

	fileStream.on('data', function(chunk) {
	//  ALWAYS RETURNS chuncks in sizes of '40960', so accumilate

			chunkarray.push(chunk);
      chunksize += chunk.length;
	    process.stdout.write(chunksize+'/'+bufsize+' progress: '+gchunks+'/'+numchunks+'\r');

        if (chunksize >= bufsize) {

    	    fileStream.pause();
	        buffer = Buffer.concat (chunkarray);

				  var sendit = buffer.slice (0, bufsize)
				  var range = 'bytes ' + (gchunks*bufsize) + '-' +  ((gchunks*bufsize)+sendit.length-1) + '/*';
				  process.stdout.write('\nsend: '+sendit.length + ', '+ range +'\n');

//					tempFile.write(sendit);

				  gchunks++, gtotsize+= sendit.length;

					chunkarray = [ buffer.slice (bufsize, buffer.length) ];
					chunksize = chunkarray[0].length;

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
	    }
	});

	fileStream.on('end', function (){
	  buffer = Buffer.concat (chunkarray);
	  if (buffer.length >0) {
		  var range = 'bytes ' + (gchunks*bufsize) + '-' +  ((gchunks*bufsize)+buffer.length-1) + '/*';
		  gchunks++, gtotsize+= buffer.length;
		  process.stdout.write('\nsend: '+buffer.length + ', '+ range +' progress: '+gchunks+'/'+numchunks+'\n');


//		  tempFile.write(buffer);
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
	});
///*
});
//*/
