import sys
import subprocess
import shlex
import re
import urllib2
import os
import yaml

from BeautifulSoup import BeautifulSoup as bs

import Image

outputDir = "news"

try:
	os.makedirs(outputDir)
except:
	if not os.path.isdir(outputDir):
		raise

f = urllib2.urlopen("https://github.com/explore")
contents = f.read()
soup = bs(contents)

trending = soup.findAll(name = "ol", attrs = {"class" : "ranked-repositories"})
featured = soup.findAll(name = "ul", attrs = {"class" : "ranked-repositories"})

# remove unnecessaries

for tag in soup.findAll(attrs = {"class": "meta"}):
	tag.extract()

for tag in soup.findAll(attrs = {"class": True}):
	del tag["class"]

for tag in soup.findAll(attrs = {"style": True}):
	del tag["style"]

for tag in soup.findAll(attrs = {"id": True}):
	del tag["id"]

for tag in soup.findAll("a"):
	tag.replaceWithChildren()

for tag in soup.findAll("img"):
	tag.extract()

for tag in soup.findAll("embed"):
	tag.extract()

for tag in soup.findAll("li", text=re.compile("^[0-9,]+$")):
	tag.extract()

for tag in soup.findAll("li"):
	if len(tag.text) == 0:
		tag.extract()

for tag in soup.findAll("ul"):
	if len(tag.contents) == 3:
		tag.extract()

for tag in soup.findAll(text=lambda text : len(text.strip()) == 0):
	tag.extract()

for tag in soup.findAll("h3"):
	tag.name = "b"

for tag in soup.findAll("ul"):
	tag.name = "ol"

# print it

s = "<h3>Trending repos</h3>"
for t in trending: s += str(t)
s += "<h3>Featured repos</h3>"
for t in featured: s += str(t)

s += "<p><a href=\"mailto:?subject=[ltrainnotwork.com] Github Explore&body=~^*^~%0A%0ASend this article to yourself by entering your email address in the to field above.%0A%0AHit send, and it will show up in your inbox when you connect to the real internet once you get off the train.%0A%0A~^*^~%0A%0Ahttp://www.github.com/explore%0A%0AThe L Train Notwork is brought to you by http://WeMakeCoolSh.it\">Email myself a link to Github Explore</a></p>"

f = open(os.path.join(outputDir, "github.html"), "w")
f.write(s)
f.close()
