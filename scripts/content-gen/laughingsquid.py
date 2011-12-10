import re

from feed import Feed

from pytz import timezone
import pytz

from datetime import datetime


class LaughingSquidFeed(Feed):
	
	def getDate(self, x):
		return x.date
		utc = timezone("UTC")
		eastern = timezone("US/Eastern")

		date = self.unicode2ascii(x.date).replace("+0000").strip()
		date = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S").replace(tzinfo=utc).astimezone(eastern)
		date = self.formatDate(date)

		return date

		
MEDIA_DIR=("img", "news", "laughingsquid_content")
TEXT_FILE=("news", "laughingsquid")
URL = "http://feeds.laughingsquid.com/laughingsquid"

feed = LaughingSquidFeed(URL, TEXT_FILE, MEDIA_DIR)
output = feed.parse()
feed.save(output)

