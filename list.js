
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

console.log ("args  1: " +  arg1 + " 2: " +  arg2);

// LIST
if (arg1 == "multi" && typeof arg2 === "undefined") {
	glacier.client.listMultipartUploads({vaultName: vaultName}, function (err,data) {
		 if (err) { console.log('Error!', err.stack); return; }
		console.log('Completed in' + JSON.stringify(data, null, 4));
	});
}


if (arg1 == "multi" && arg2 !== "undefined") {
        glacier.client.listParts({vaultName: vaultName, uploadId: arg2 }, function (err,data) {
                 if (err) { console.log('Error!', err.stack); return; }
                console.log('Completed in' + JSON.stringify(data, null, 4));
        });
}

if (arg1 == "vault") {
	glacier.client.describeVault({vaultName: vaultName}, function (err,data) {
		 if (err) { console.log('Error!', err.stack); return; }
		console.log('Completed in' + JSON.stringify(data, null, 4));
	});
}

if (arg1 == "job" && typeof arg2 !== "undefined") {
	glacier.client.describeJob({vaultName: vaultName, jobId: arg2}, function (err,data) {
		 if (err) { console.log('Error!', err.stack); return; }
		console.log('Completed in' + JSON.stringify(data, null, 4));
	});
}

var gitfile = function(fname, awsloc) {
		var opts = aws4.sign({ service: 'glacier', region: env.AWS_REGION, path: awsloc, headers: { 'X-Amz-Glacier-Version': '2012-06-01' } })
		console.log ("HTTP GET location : " + JSON.stringify(opts));
		var file = fs.createWriteStream(fname);
		http.request(opts, function(res) { res.pipe(file) }).end();
}

if (arg1 == "retrieve") {
	var jparams = { 
		Format: "JSON", 
		Description: "RET001", 
		Type: ((typeof arg2 !== "undefined") ? "archive-retrieval" : "inventory-retrieval") 
	};
	if (typeof arg2 !== "undefined") jparams.ArchiveId = arg2;
	console.log ("Retreive request : " + JSON.stringify(jparams));

	glacier.client.initiateJob({vaultName: vaultName, jobParameters : jparams}, function (err,data) {
		if (err) { console.log('Error!' + err.stack); return; }
		console.log('Completed in' + JSON.stringify(data, null, 4));
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
	});
}

if (arg1 == "get" && arg2 !== "undefined") {
	gitfile ("file.out", arg2);
/*
        glacier.client.getJobOutput({vaultName: vaultName, jobId: arg2 }, function (err,data) {
                 if (err) { console.log('Error!', err.stack); return; }
                console.log('Completed data : ' + data);
        });
*/
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

