


# AWS GLACIER

# ----------------------------------
# UPLOADING
# ----------------------------------

# initiate a multi-part upload (does a nohup) output to logfile
uploadbg.sh <filename>  

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

# download the archive to "file.out"
nodejs list.js getstream <location>
