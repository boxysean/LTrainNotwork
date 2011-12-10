import re

from feed import Feed

from pytz import timezone
import pytz

from datetime import datetime


class VillageVoiceFeed(Feed):
	
	def getDate(self, x):
#		utc = timezone("UTC")
#		pacific = timezone("US/Pacific")
#
#		date = self.unicode2ascii(x.date).replace("PDT", "").replace("PST", "").strip()
#		date = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S").replace(tzinfo=pacific).astimezone(utc)
#		date = self.formatDate(date)

		return x.date

		
MEDIA_DIR=("img", "news", "villagevoice_content")
TEXT_FILE=("news", "villagevoice")
URL = "http://blogs.villagevoice.com/runninscared/rss.xml"

feed = VillageVoiceFeed(URL, TEXT_FILE, MEDIA_DIR)
output = feed.parse()
feed.save(output)

