# Run upload to Glacier in Background
. ./ENV.sh
LOC=$1
LOGFILE="Log-upload `date`.log"
echo "Uploading $LOC - $LOGFILE" >"$LOGFILE"
if [ -d $LOC ]; then
    BASE=`basename $LOC`
    DIR=`dirname $LOC`
	(
	    cd $DIR
	    echo "tar'ing directory $LOC..."
	    tar cf $BASE.tar $BASE
	)
    LOC=$DIR/$BASE.tar
	
fi
echo "starting upload of $LOC...(nohup)"
nohup nodejs upload.js $LOC >"$LOGFILE" 2>&1  &
