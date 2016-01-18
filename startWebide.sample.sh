#!/bin/bash


# These must be absolute paths
WORKSPACEDIR="/home/foo/"
WEBDOMAIN="example.com"
WEBURI=""

docker run -d -P \
	-v "$WORKSPACEDIR:/data" \
	-e "SERVICE_TAGS=urlprefix-$WEBDOMAIN/$WEBURI" \
	-e "SERVICE_NAME=webide" \
	-e "SERVICE_80_CHECK_HTTP=/" \
	-e "SERVICE_80_CHECK_INTERVAL=5s" \
	--name webide \
	aducastel/webide $*
