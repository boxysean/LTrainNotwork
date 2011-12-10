import re

from feed import Feed

from pytz import timezone
import pytz

from datetime import datetime


class NewYorkTimesFeed(Feed):
	
	def getDate(self, x):
		utc = timezone("UTC")
		eastern = timezone("US/Eastern")

	        date = self.unicode2ascii(x.updated)
	        date = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S %Z").replace(tzinfo=utc).astimezone(eastern)

		date = self.formatDate(date)

		return date

		
MEDIA_DIR=("img", "news", "nytimes_content")
TEXT_FILE=("news", "nytimes")
URL = "http://feeds.nytimes.com/nyt/rss/HomePage"

feed = NewYorkTimesFeed(URL, TEXT_FILE, MEDIA_DIR)
output = feed.parse()
feed.save(output)

