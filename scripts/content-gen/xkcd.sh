#!/bin/bash

FULL_DIR="img/xkcd/full"
THUMB_DIR="img/xkcd/thumbnail"
TMP=$(mktemp /tmp/tmp.XXXXXXXXX).jpg
WORDS=$(mktemp /tmp/tmp.XXXXXXXXX).jpg
IMAGE=$(mktemp /tmp/tmp.XXXXXXXXX).jpg

YAML="img/xkcd/gallery.yaml"

echo "title: xkcd" > $YAML
echo "description: A webcomic of romance, sarcasm, math, and language." >> $YAML

COMICS=20

if [ ! -d $FULL_DIR ]; then
	mkdir -p $FULL_DIR
fi

if [ ! -d $THUMB_DIR ]; then
	mkdir -p $THUMB_DIR
fi

ID=$(python xkcd.py)

echo "images:" >> $YAML

for i in `jot $COMICS $ID $(($ID-$COMICS))`; do
	wget http://xkcd.com/$i/ -O $TMP 2> /dev/null

	wget `grep http://imgs.xkcd.com/comics/ $TMP 2> /dev/null | head -1 | cut -d\" -f2` -O $IMAGE

	WIDTH=$(identify -format "%w" $IMAGE)

	echo "$(grep http://imgs.xkcd.com/comics/ $TMP | head -1 | cut -d\" -f4 | sed "s/&#39;/'/g")" | convert -background white -fill blue -gravity center -pointsize 16 -size ${WIDTH}x caption:@- $WORDS

	convert -append $IMAGE $WORDS $FULL_DIR/$i.jpg

	convert -background white -fill blue -gravity center -pointsize 32 -size 75x75 caption:"$i" $THUMB_DIR/$i.jpg

	rm $IMAGE
	rm $WORDS
	rm $TMP

	echo "- file: \"$i.jpg\"" >> $YAML
	echo "  title: \"$i\"" >> $YAML
done

