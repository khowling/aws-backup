
var AWS = require('aws-sdk-js');
AWS.config.loadFromPath('./config.json');
// Set your region for future requests.
AWS.config.update({region: 'us-east-1'});



var glacier = new AWS.Glacier(),
    vaultName = 'hstore';


var arg1 = process.argv[2],
    arg2 = process.argv[3];

console.log ('args  1: ' +  arg1 + ' 2: ' +  arg2);

if (arg1 == 'multi' && arg2 == null) {
	glacier.client.listMultipartUploads({vaultName: vaultName}, function (err,data) {
		 if (err) { console.log('Error!', mpErr.stack); return; }
		console.log('Completed in' + JSON.stringify(data, null, 4));
	});
}

if (arg1 == 'multi' && arg2 !== null) {
        glacier.client.listParts({vaultName: vaultName, uploadId: arg2 }, function (err,data) {
                 if (err) { console.log('Error!', mpErr.stack); return; }
                console.log('Completed in' + JSON.stringify(data, null, 4));
        });
}

if (arg1 == 'desc') {
	glacier.client.describeVault({vaultName: vaultName}, function (err,data) {
		 if (err) { console.log('Error!', mpErr.stack); return; }
		console.log('Completed in' + JSON.stringify(data, null, 4));
	});
}

if (arg1 == 'abort' && arg2 !== null) {
	console.log ('aborting : ' + arg2);
        glacier.client.abortMultipartUpload({vaultName: vaultName, uploadId: arg2 }, function (err,data) {
                 if (err) { console.log('Error!', mpErr.stack); return; }
                console.log('Completed in' + JSON.stringify(data, null, 4));
        });
}

