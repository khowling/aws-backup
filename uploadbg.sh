# Run upload to Glacier in Background
LOGFILE="upload-`date`.log"
echo "Uploading $1 - $LOGFILE"
nohup nodejs upload.js $1 >"$LOGFILE" 2>&1  &
