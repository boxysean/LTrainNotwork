import sys
import subprocess
import shlex
import re
import urllib2
import os
import yaml

from BeautifulSoup import BeautifulSoup as bs

import Image

outputDir = ("img", "xkcd")

try:
	os.makedirs(os.path.join(*outputDir))
except:
	if not os.path.isdir(os.path.join(*outputDir)):
		raise

try:
	os.makedirs(os.path.join(*(list(outputDir) + ["thumbnail"])))
except:
	if not os.path.isdir(os.path.join(*(list(outputDir) + ["thumbnail"]))):
		raise

try:
	os.makedirs(os.path.join(*(list(outputDir) + ["full"])))
except:
	if not os.path.isdir(os.path.join(*(list(outputDir) + ["full"]))):
		raise

# fetch the latest comic number

url = "http://www.xkcd.com/"
f = urllib2.urlopen(url)
contents = f.read()
soup = bs(contents)
text = soup.findAll(text=re.compile("Permanent link to this comic:.*"))
m = re.match("Permanent link to this comic: http://xkcd.com/([0-9]+)/", text[0])
lastId = m.group(1)

print lastId

sys.exit(0)

cmd = "flickcurl photos.search license 1,2,3,4,5,6 tag-mode all per-page 12 tags " + tags
args = shlex.split(cmd)
p = subprocess.Popen(args, stdout=subprocess.PIPE)

lines = p.communicate()

idre = re.compile("photo with URI .* ID ([0-9]+)")
ownerre = re.compile("field owner_nsid .* string value: '(.+)'")
titlere = re.compile("field title .* string value: '(.+)'")

images = []

fileId = 0

def resize(input, output, width = 500, height = 500):
	try:
		i = Image.open(input)

		if i.mode != "RGB":
			i = i.convert("RGB")

		i.thumbnail((width, height))
		i.save(output, "JPEG")

	except Exception, e:
		print >> sys.stderr, "warning:", e

def fetch(id, owner, filePath, fileName):
	url = "http://www.flickr.com/%s/%s" % (owner, id)
	f = urllib2.urlopen(url)
	contents = f.read()
	soup = bs(contents)
	imgs = soup.findAll(attrs = {"alt" : "photo"})
	for img in imgs:
		imgurl = img["src"]
		i = urllib2.urlopen(imgurl)
		largeFile = os.path.join(*[filePath, "full", fileName])
		thumbFile = os.path.join(*[filePath, "thumbnail", fileName])
		f = open(largeFile, "w")
		f.write(i.read())
		f.close()
		resize(largeFile, largeFile, 500, 500)
		resize(largeFile, thumbFile, 75, 75)

for line in lines[0].split("\n"):
	m = idre.search(line)

	if m:
		id = m.group(1)
#		print "id", m.group(1)
		continue

	m = ownerre.search(line)

	if m:
		owner = m.group(1)
#		print "owner", m.group(1)
		continue

	m = titlere.search(line)

	if m:
		title = m.group(1)
		continue

	if line.startswith("notes"):
#		print id, owner, title
		fileName = "%05d.jpg" % fileId 
		filePath = os.path.join(*outputDir)
		fetch(id, owner, filePath, fileName)
		fileId = fileId + 1

		images.append({"title": title, "file": fileName})

		title = ""
		id = ""
		owner = ""

yamlDict = {
	"description" : "Flickr photos tagged " + tags,
	"title" : tags,
	"images" : images
}

yamlFile = os.path.join(*(list(outputDir) + ["gallery.yaml"]))
f = open(yamlFile, "w")
f.write(yaml.dump(yamlDict))
f.close()
