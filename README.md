aws-backup
==========

A Node app for Streaming backups to Amazon Glacier

When you initiate a job, Amazon Glacier returns a job ID in the response and executes the job asynchronously. After the job completes, you can download the job output.

Most Amazon Glacier jobs take about four hours to complete. Amazon Glacier must complete a job before you can get its output. A job will not expire for at least 24 hours after completion, which means you can download the output within the 24-hour period after the job is completed


Download an Archive

http://docs.aws.amazon.com/amazonglacier/latest/dev/downloading-an-archive.html

1. To initiate an "archive retrieval" job you must know the ID of the archive that you want to retrieve. You can get the archive ID from an inventory of the vault

	
