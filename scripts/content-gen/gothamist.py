import re

from feed import Feed

from pytz import timezone
import pytz

from datetime import datetime


class GothamistFeed(Feed):
	
	def getDate(self, x):
		utc = timezone("UTC")
		eastern = timezone("US/Eastern")

		date = re.sub(r"[+-][0-9:]{4,5}$", r"", self.unicode2ascii(x.updated).replace("T", " "))
		date = datetime.strptime(date, "%Y-%m-%d %H:%M:%S").replace(tzinfo=eastern).astimezone(utc)
		return self.formatDate(date)

		
MEDIA_DIR=("img", "news", "gothamist_content")
TEXT_FILE=("news", "gothamist")
URL = "http://gothamist.com/index.rdf"

feed = GothamistFeed(URL, TEXT_FILE, MEDIA_DIR)
output = feed.parse()
feed.save(output)

