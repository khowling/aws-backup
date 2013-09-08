
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
    uploadid = process.argv[3],
    startbyteidx = 4,
    vaultName = 'hstore',
    TESTFILE = false,
    PART_SIZE = 64 * 1024 * 1024;  // 62 Mb chunks


var stat = fs.statSync(fname),
    numchunks = Math.ceil(stat.size/PART_SIZE);

console.log (new Date().toUTCString() + ' : uploading file: ' + fname + ',file size: ' + stat.size + ', Number of Parts:' + numchunks);

var startTime = new Date();
var thStream = treehash.createTreeHashStream ();

var commenceUpload = function (mpErr, multipart) {

	if (mpErr) { 
		console.log( new Date().toUTCString() + ' : initiateMultipartUpload error : ' + mpErr.stack);
		return; 
  }
  console.log( new Date().toUTCString() + ' : initiateMultipartUpload uploadID : ' + multipart.uploadId);

	if (TESTFILE) {
	  var tempFile = fs.createWriteStream('test.out');
	}



  var chunkarray = [],
      chunksize = 0,
			gchunks = 0,  
			gtotsize = 0;

	var fileStream = fs.createReadStream(fname , {bufferSize: PART_SIZE });

	//  on data ::  ALWAYS RETURNS chuncks in sizes of '40960', so accumilate
	fileStream.on('data', function(chunk) {

		chunkarray.push(chunk);
    chunksize += chunk.length;

    if (chunksize >= PART_SIZE) {

			fileStream.pause();
			var concatBuffer  = Buffer.concat (chunkarray);
			var sendit = concatBuffer.slice (0, PART_SIZE)
			chunkarray = [ concatBuffer.slice (PART_SIZE, concatBuffer.length) ];
			chunksize = chunkarray[0].length;

			var range = 'bytes ' + (gchunks*PART_SIZE) + '-' +  ((gchunks*PART_SIZE)+sendit.length-1) + '/*';
			console.log (new Date().toUTCString() + ' : Sending: '+sendit.length + ', '+ range);


			if (TESTFILE) {
				tempFile.write(sendit);
				fileStream.resume();
			} else {

				thStream.update(sendit);
				if (typeof process.argv[4] === "undefined" || (process.argv[startbyteidx] == (gchunks*PART_SIZE))) {
					if (typeof process.argv[(startbyteidx+1)] !== "undefined") startbyteidx++;
					glacier.client.uploadMultipartPart( {
						vaultName: vaultName,
						uploadId: multipart.uploadId,
						range: range,
						body: sendit },  
						function(err, data) {
						  if (err) {
							 console.log(new Date().toUTCString() + ' : Multipart error occurred while uploading the archive');
							 console.log(err);
						  } else {
								console.log (new Date().toUTCString() + ' : Multipart SENT, range : ' + range); 
							}	
						  fileStream.resume();
					  });
				} else {
					console.log (new Date().toUTCString() + ' : Multipart SKIP : ' + (gchunks*PART_SIZE));
				  fileStream.resume();
				}
			}

			gchunks++, gtotsize+= sendit.length;
		}
	});

	// ON : END
	fileStream.on('end', function (){


		var finishit = function () {

			if (TESTFILE) {
				tempFile.end();
			} else {
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
								 var delta = (new Date() - startTime) / 1000;
							 console.log('Completed upload in', delta, 'seconds');
							 console.log('Archive ID: ', data.archiveId);
							 console.log('Archive Name: ' + fname);
							 console.log('location URI: ', data.location);
							 console.log('Checksum: ', data.checksum);
								}
				});
			}
		};

		var concatBuffer  = Buffer.concat (chunkarray);
	  if (concatBuffer.length >0) {
		  var range = 'bytes ' + (gchunks*PART_SIZE) + '-' +  ((gchunks*PART_SIZE)+concatBuffer.length-1) + '/*';
		  gchunks++, gtotsize+= concatBuffer.length;
		  process.stdout.write('\nsend: '+concatBuffer.length + ', '+ range +' progress: '+gchunks+'/'+numchunks+'\n');


			if (TESTFILE) {
			  tempFile.write(concatBuffer);
				finishit();
			} else { 
				thStream.update(concatBuffer);
				glacier.client.uploadMultipartPart( {
		  		vaultName: vaultName,
		  		uploadId: multipart.uploadId,
		  		range: range,
		  		body: concatBuffer },  
		 			function(err, data) {
						if (err) {
				  		console.log("An error occurred while uploading the archive");
				  		console.log(err);
						}	
						finishit();
					});
			}
	  } else {
			finishit();
	  }
	});
}

if (TESTFILE) {
	commenceUpload(null, { uploadId : 'TOFILE'});
} else {
  if (uploadid) {
		console.log ('\n' + new Date().toUTCString() + ' : initiateMultipartUpload : ' + uploadid);
		commenceUpload(null, { uploadId : uploadid});
	} else {
		var opts = {vaultName: vaultName, archiveDescription: fname, partSize: PART_SIZE.toString()};
		console.log ('\n' + new Date().toUTCString() + ' : initiateMultipartUpload : ' + JSON.stringify(opts));
		glacier.client.initiateMultipartUpload(opts, commenceUpload);
	}
}
