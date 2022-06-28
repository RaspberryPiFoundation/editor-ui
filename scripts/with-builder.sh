#!/bin/bash -eu

# This script takes a command and executes it inside a container created with
# the showcase:builder image, allowing easy-ish updates to Gemfile.lock and
# yarn.lock.

cmd="$*"

# The image we're working against
image="editor-ui_react-ui:latest"

# Files we copy in to the builder, and then out again.  These files are the
# ones in the builder target of the Dockerfile.
files="package.json yarn.lock"

# Change to the repo root directory.
cd $(dirname $0)/..

function log() {
	echo '>>> ' $*
}

# Container inside which we'll make our changes
log "Creating new container from $image"
builder=$(docker create -it $image $cmd)

function cleanup () {
	log "Removing $image container"
	docker rm -f $builder || true
}

# Ensure our created container is removed on exit
trap cleanup EXIT

log "Copying files to $image container"
for f in $files ; do
	docker cp $f $builder:/app/
done

log "Starting $image container"
docker start -ai $builder

# Now the command has run, commit the changes, so that if we run this again,
# we'll start from this point.
log "Committing changes against the $image image"
docker commit $builder $image

log "Copying files back out of the $image container"
for f in $files ; do
	docker cp $builder:/app/$f $f
done
