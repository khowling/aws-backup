
var http = require('http'),
    fs = require('fs'),
    aws4  = require('aws4'),
    env = process.env,
    AWS = require('aws-sdk-js');

// Set your region for future requests.
//AWS.config.loadFromPath('./config.json');
//AWS.config.update({region: awsregion});

AWS.config.update({accessKeyId: env.AWS_ACCESS_KEY, secretAccessKey: env.AWS_SECRET_KEY, region: env.AWS_REGION});


var glacier = new AWS.Glacier(),
    vaultName = 'hstore';


var arg1 = process.argv[2],
    arg2 = process.argv[3];
    arg3 = process.argv[4];

var usageExit = function() {
	console.log ("usage:  \n\n\
				multi [uploadId]     # list Mulitpart Uploads\n\
				vault                # Describe Vault\n\
				retreive [archiveId] # initiate Job to retreive your 'inventory' or retrive an archive (can take 12hrs)\n\
				jobs                 # List all Jobs requested \n\
				job <JobId>          # Describe Job (is job complete?)\n\
				get <JobId>          # Get results of 'inventory' job (to stdout)\n\
				getstream <jobId> <target filename> # Get results of archive job\n\
				delete <archiveId>   # WARNING: Delete an archive\n\n");
	return;
}

if (typeof arg1 === "undefined") {
	usageExit();
	return;
}

// LIST
if (arg1 == "multi") {
  if (typeof arg2 === "undefined") {
					glacier.client.listMultipartUploads({vaultName: vaultName}, function (err,data) {
						 if (err) { console.log('Error!', err.stack); return; }
						console.log('Completed in' + JSON.stringify(data, null, 4));
					});
  } else {
        glacier.client.listParts({vaultName: vaultName, uploadId: arg2 }, function (err,data) {
                 if (err) { console.log('Error!', err.stack); return; }
                console.log('Completed in' + JSON.stringify(data, null, 4));
        });
  }
}


if (arg1 == "vault") {
	console.log ('\n' + new Date().toUTCString() + ' : describeVault requested');
	glacier.client.describeVault({vaultName: vaultName}, function (err,data) {
		 if (err) { console.log(new Date().toUTCString() + ' : describeVault error : ', err.stack); return; }
		console.log(new Date().toUTCString() + ' : describeVault completed : ' + JSON.stringify(data, null, 4));
	});
}

if (arg1 == "job" && typeof arg2 !== "undefined") {
	console.log ('\n' + new Date().toUTCString() + ' : describeJob requested jobID: ' + arg2);
	glacier.client.describeJob({vaultName: vaultName, jobId: arg2}, function (err,data) {
		 if (err) { console.log(new Date().toUTCString() + ' : describeJob error : ', err.stack); return; }
		console.log(new Date().toUTCString() + ' : describeJob completed : ' + JSON.stringify(data, null, 4));
	});
}


if (arg1 == "retrieve") {
	var jparams = { 
		Type: ((typeof arg2 !== "undefined") ? "archive-retrieval" : "inventory-retrieval") 
	};
	if (typeof arg2 !== "undefined") jparams.ArchiveId = arg2;
	console.log ('\n' + new Date().toUTCString() + ' : Retreive requested : ' + JSON.stringify(jparams));

	glacier.client.initiateJob({vaultName: vaultName, jobParameters : jparams}, function (err,data) {
		if (err) { console.log(new Date().toUTCString() + ' : Retreive error : ' + err.stack); return; }
		console.log(new Date().toUTCString() + ' : Retreive completed : ' + JSON.stringify(data, null, 4));

/*  
		var checkjobcomplete = function () {
			glacier.client.describeJob({vaultName: vaultName, jobId: data.jobId}, function (jerr,jdata) {
					if (jerr) { console.log('Error!', jerr.stack); return; }
					console.log('Completed in' + JSON.stringify(jdata, null, 4));
					if (jdata.Completed) {
						gitfile ("file.out", data.location);
					}
					else {
						setTimeout(checkjobcomplete, 60*1000);
					}
			});
		}
		// wait 2mins, then check for job complete
		setTimeout(checkjobcomplete, 120*1000);
*/

	});
}

if (arg1 == "getstream" && arg2 !== "undefined" && arg3 != "undefined" ) {
		var opts = aws4.sign({ service: 'glacier', region: env.AWS_REGION, path: '/-/vaults/'+vaultName+'/jobs/'+arg2+'/output', headers: { 'X-Amz-Glacier-Version': '2012-06-01' } })
	  console.log ('\n' + new Date().toUTCString() + ' : get requested to file <'+ arg3 +'> : ' + JSON.stringify(opts));
		var file = fs.createWriteStream(arg3);
		var req = http.request(opts, function(res) { 
			console.log('STATUS: ' + res.statusCode);
  		console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.pipe(file);
		 		}).on ('error', function (e) {
		console.log('problem with request: ' + e.message);
	}).end();
 
}

if (arg1 == "jobs") {
	console.log ('\n' + new Date().toUTCString() + ' : get jobs');
	glacier.client.listJobs({vaultName: vaultName }, function (err,data) {
		if (err) { console.log(new Date().toUTCString() + ' : get jobs error : ' +  err.stack); return; }
	  	console.log (new Date().toUTCString() + ' : get jobs completed : ' + JSON.stringify(data, null, 4));
	});
}



if (arg1 == "get" && arg2 !== "undefined") {
/*
	gitfile ("file.out", arg2);
*/
	glacier.client.getJobOutput({vaultName: vaultName, jobId: arg2 }, function (err,data) {
		if (err) { console.log('Error!', err.stack); return; }
		var resObj = JSON.parse(data.body);
		console.log(JSON.stringify(resObj, null, 4));
	});
}


if (arg1 == "abort" && typeof arg2 !== "undefined") {
	console.log ('aborting uploadId: ' + arg2);
        glacier.client.abortMultipartUpload({vaultName: vaultName, uploadId: arg2 }, function (err,data) {
                 if (err) { console.log('Error!', err.stack); return; }
                console.log('Completed in' + JSON.stringify(data, null, 4));
        });
}

// DELETE
if (arg1 == "delete" && typeof arg2 !== "undefined") {
	console.log ('deleting archiveId: ' + arg2);
	glacier.client.deleteArchive({vaultName: vaultName, archiveId: arg2}, function (err,data) {
		 if (err) { console.log('Error!', mpErr.stack); return; }
		console.log('Completed in' + JSON.stringify(data, null, 4));
	});
}

