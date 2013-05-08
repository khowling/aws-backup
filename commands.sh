


# start a retrieve job to get the inventory (with no ArchiveID parameter)
nodejs list.js retrieve

# get the status of the retreive job requsted
nodejs list.js job 0jd4ouo8cSaTDif3Gd8zZ9eCoocBvmNILUnmwEAgB27svWz58BWZ75TODceoGxAiYAKBOM7bXJMux93C-a0OpYJXFclW

# get the job request once its complete
nodejs list.js get /306247516467/vaults/hstore/jobs/0jd4ouo8cSaTDif3Gd8zZ9eCoocBvmNILUnmwEAgB27svWz58BWZ75TODceoGxAiYAKBOM7bXJMux93C-a0OpYJXFclW
