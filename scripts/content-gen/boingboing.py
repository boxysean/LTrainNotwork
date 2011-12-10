import re

from feed import Feed

from pytz import timezone
import pytz

from datetime import datetime


class BoingBoingFeed(Feed):
	
	def getDate(self, x):
		utc = timezone("UTC")
		pacific = timezone("US/Pacific")

		date = self.unicode2ascii(x.date).replace("PDT", "").replace("PST", "").strip()
		date = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S").replace(tzinfo=pacific).astimezone(utc)
		date = self.formatDate(date)

		return date

		
MEDIA_DIR=("img", "news", "boingboing_content")
TEXT_FILE=("news", "boingboing")
URL = "http://feeds.boingboing.net/boingboing/iBag"

feed = BoingBoingFeed(URL, TEXT_FILE, MEDIA_DIR)
output = feed.parse()
feed.save(output)

