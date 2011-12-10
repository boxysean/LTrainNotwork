import re

from feed import Feed

from pytz import timezone
import pytz

from datetime import datetime

from BeautifulSoup import NavigableString, Comment


class FastCompanyFeed(Feed):

	def process(self, x):
		for i in x.findAll(name="img", attrs={"src":re.compile("feedburner")}):
			i.extract()

		for i in x.findAll(name="img", attrs={"src":re.compile("doubleclick")}):
			i.extract()

	def getDate(self, x):
		return x.date

		
MEDIA_DIR=("img", "news", "fastcompany_content")
TEXT_FILE=("news", "fastcompany")
URL = "http://feeds.feedburner.com/fastcompany/headlines"

feed = FastCompanyFeed(URL, TEXT_FILE, MEDIA_DIR)
output = feed.parse()
feed.save(output)

