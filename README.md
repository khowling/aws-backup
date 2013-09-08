aws-backup
==========

A Node app for Streaming backups to Amazon Glacier

When you initiate a job, Amazon Glacier returns a job ID in the response and executes the job asynchronously. After the job completes, you can download the job output.

Most Amazon Glacier jobs take about four hours to complete. Amazon Glacier must complete a job before you can get its output. A job will not expire for at least 24 hours after completion, which means you can download the output within the 24-hour period after the job is completed


Download an Archive

http://docs.aws.amazon.com/amazonglacier/latest/dev/downloading-an-archive.html

To initiate an "archive retrieval" job you must know the ID of the archive that you want to retrieve. You can get the archive ID from an inventory of the vault

	



# AWS GLACIER - syntax

# ----------------------------------
# UPLOADING
# ----------------------------------

# initiate a multi-part upload (does a nohup) output to logfile
uploadbg.sh <filename>  

# retry individual parts failed from prevoius mutli upload attempt
nodejs upload.js <filename> <uploadID> <startbyte> <startbyte> ....

#  list the parts of a specific multipart upload. It returns information about the parts that you have uploaded for a multipart upload
nodejs list.js multi <uploadId>

# lists obtain a list of multipart uploads in progress. An in-progress multipart upload is an upload that you have initiated, but have not yet completed or aborted
nodejs list.js multi


# abort a mult-part upload
nodejs list.js abort <uploadId>




# ----------------------------------
#  RETRIEVING / DOWNLOADING A ARCHIVE
# ----------------------------------

# start a "inventiry-retrieval" job to get the inventory (with no ArchiveID parameter)
nodejs list.js retrieve

# get the status of the retreive job requsted, to see when the results are ready (takes around 4hrs)
nodejs list.js job <jobId>

# get the results of the "inventory" job request once its complete 
nodejs list.js get /306247516467/vaults/hstore/jobs/0jd4ouo8cSaTDif3Gd8zZ9eCoocBvmNILUnmwEAgB27svWz58BWZ75TODceoGxAiYAKBOM7bXJMux93C-a0OpYJXFclW

## from the Inventory, obtain the <archiveID> of the archive you wish to download
# start a "archive-retrieval" job to get the inventory (with no ArchiveID parameter)
nodejs list.js retrieve <archiveId>

# get the status of the retreive job requsted, to see when the results are ready (takes around 4hrs)
nodejs list.js job <jobId>

# download the archive to <file.out>
nodejs list.js getstream <jobId> <file.out>


# -------------------- OTHER
#  List all jobs
nodejs list.js jobs 
#  Delete Archive
nodejs list.js delete <archiveId>
#  Show Vault stats
nodejs list.js vault
nodejs list.js jobs 
