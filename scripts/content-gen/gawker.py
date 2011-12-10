import re

from feed import Feed

from pytz import timezone
import pytz

from datetime import datetime


class GawkerFeed(Feed):

	def process(self, soup):
		adTag = soup.find("br")

		while adTag:
			bTag = adTag
			adTag = adTag.nextSibling
			bTag.extract()

	def getDate(self, x):
		utc = timezone("UTC")
		pacific = timezone("US/Eastern")

#		date = self.unicode2ascii(x.date).replace("EDT", "").replace("EST", "").strip()
#		date = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S").replace(tzinfo=pacific).astimezone(utc)
#		date = self.formatDate(date)

		return x.date

		
MEDIA_DIR=("img", "news", "gawker_content")
TEXT_FILE=("news", "gawker")
URL = "http://feeds.gawker.com/gawker/full"

feed = GawkerFeed(URL, TEXT_FILE, MEDIA_DIR)
output = feed.parse()
feed.save(output)

