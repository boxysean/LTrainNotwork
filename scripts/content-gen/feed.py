import feedparser
import unicodedata
import re
import os
import sys

from pytz import timezone
import pytz

from BeautifulSoup import BeautifulSoup as bs

import urlparse
from urllib2 import urlopen
from urllib import urlretrieve

from datetime import datetime

import Image

import copy

class Feed(object):

	def __init__(self, url, outputFile, mediaDir = None):
		self.url = url
		self.outputFile = outputFile
		self.mediaDir = mediaDir
		self.webMediaDir = mediaDir

		if mediaDir:
			try:
				os.makedirs(os.path.join(*mediaDir))
			except:
				if not os.path.isdir(os.path.join(*mediaDir)):
					raise

		try:
			os.makedirs(os.path.join(*outputFile[0:1]))
		except:
			if not os.path.isdir(os.path.join(*outputFile[0:1])):
				raise

	def unicode2ascii(self, text):
		if type(text) == unicode:
			return unicodedata.normalize("NFKD", text).encode("ascii", "ignore")
		else:
			return text

	def getTitle(self, x):
		return self.unicode2ascii(x.title)

	def getAuthor(self, x):
		return self.unicode2ascii(x.author) if x.has_key("author") else ""

	def getLink(self, x):
		return self.unicode2ascii(x.links[0].href)

	def getSummary(self, x):
		return self.unicode2ascii(x.summary)

	def getDate(self, x):
		return self.unicode2ascii(x.updated)

	def process(self, soup):
		adTag = soup.find("br", attrs = {"clear": "both"})

                while adTag:
                        bTag = adTag
                        adTag = adTag.nextSibling
                        bTag.extract()

	def postProcess(self, str):
		return str
        
	def formatDate(self, date):
		return datetime.strftime(date, "%a, %d %b at %H:%M %p")

	def saveImages(self, soup):
		for image in filter(lambda x : re.search("(png|PNG|jpg|JPG|gif|GIF|jpeg|JPEG)", x["src"]) is not None, soup.findAll("img")):
			file = image["src"].split("/")[-1]
			dest = os.path.join(*(list(self.mediaDir) + [file]))
			
			# resize
			try:
				urlretrieve(image["src"], dest)
				i = Image.open(dest)
	
				if i.mode != "RGB":
					i = i.convert("RGB")
	
				i.thumbnail((500, 500))
				i.save(dest + "-thumb.jpg", "JPEG")
	
				image["src"] = os.path.join(*(list(self.webMediaDir) + [file + "-thumb.jpg"]))

				if image.has_key("width"):
					del image["width"]
		
				if image.has_key("height"):
					del image["height"]

			except Exception, e:
				image.extract()
				print >> sys.stderr, "warning:", e, image["src"]
	
			# delete unnecessary large file
			try:
				os.remove(dest)
			except Exception, e:
				print >> sys.stderr, "warning:", e, image["src"]
				

	def parse(self):
		content = feedparser.parse(self.url)
		res = ""
		headlines = []

		LINE_BREAK = "%0A%0A"

		emailInstr = "~^*^~" + LINE_BREAK + "Send this article to yourself by entering your email address in the to field above." + LINE_BREAK + "Hit send, and it will show up in your inbox when you connect to the real internet once you get off the train." + LINE_BREAK + "~^*^~" + LINE_BREAK
		emailFooter = LINE_BREAK + "The L Train Notwork is brought to you by http://WeMakeCoolSh.it"

		for x in content.entries:
			title = self.getTitle(x)
			author = self.getAuthor(x)
			link = self.getLink(x)
			summary = self.getSummary(x)
			date = self.getDate(x)
		
			soup = bs(summary)

			# strip all unnecessary and unreachable tags
		
			for tag in soup.findAll(attrs = {"class": True}):
				del tag["class"]
		
			for tag in soup.findAll(attrs = {"style": True}):
				del tag["style"]
				
			for tag in soup.findAll(attrs = {"id": True}):
				del tag["id"]
		
			for tag in soup.findAll("a"):
				tag.replaceWithChildren()

			for tag in soup.findAll("embed"):
				tag.extract()

			self.process(soup)

			if self.mediaDir is not None:
				self.saveImages(soup)

			soupStrip = copy.deepcopy(soup)
			soupStrip = ''.join([e for e in soupStrip.recursiveChildGenerator() if isinstance(e,unicode)])
			soupStrip = soupStrip.replace("\"", "'").replace("\n", LINE_BREAK)

			summary = self.postProcess(str(soup))

			try:
				item = "<div>\n<h3>%s</h3>\n<p class=\"news-date\">%s</p>\n" % (title, date)
			
				if author is not None:
					item += "<p class=\"news-author\">%s</p>\n" % (author)
			
				item += "<div class=\"news-summary\">\n%s\n</div>\n" % (summary)
				item += "<p class=\"news-mailme\"><a href=\"mailto:?subject=%s&body=%s%s%s%s%s\">Email this to myself</a></p></div>" % ("[ltrainnotwork.com] " + title.replace("\"", "'"), emailInstr, soupStrip, LINE_BREAK, link, emailFooter)

				item += "<br /><br />"
	
				res += item

				if len(headlines) < 2:
					headlines.append(title)
			except:
				print "error, ignoring"
				continue

		return (res, headlines)
		
	def save(self, s):
		f = open(os.path.join(*self.outputFile) + ".html", "w")
		f.write(s[0])
		f.close()

		f = open(os.path.join(*self.outputFile) + "-headlines.html", "w")
		first = True
		for headline in s[1]:
			if first:
				first = False
			else:
				f.write("<br />\n")
			f.write("<p>%s</p>\n" % headline)

		f.close()

