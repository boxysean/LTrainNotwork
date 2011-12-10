import re

from feed import Feed

from pytz import timezone
import pytz

from datetime import datetime

from BeautifulSoup import NavigableString, Comment


class GizmodoFeed(Feed):

#	def process(self, x):
#		comments = x.findAll(text=lambda text:isinstance(text, Comment))
#		[comment.extract() for comment in comments]
#
#		return super(self.__class__, self).process(x)

#	def postProcess(self, s):
##		print s
#		s.replace("More&nbsp;&raquo;", "")
#		s.replace("More")
#		return s
	
	def getDate(self, x):
		return x.date
#		utc = timezone("UTC")
#		pacific = timezone("US/Pacific")
#
#		date = self.unicode2ascii(x.date).replace("PDT", "").replace("PST", "").strip()
#		date = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S").replace(tzinfo=pacific).astimezone(utc)
#		date = self.formatDate(date)
#
#		return date

		
MEDIA_DIR=("img", "news", "gizmodo_content")
TEXT_FILE=("news", "gizmodo")
URL = "http://feeds.gawker.com/gizmodo/full"

feed = GizmodoFeed(URL, TEXT_FILE, MEDIA_DIR)
output = feed.parse()
feed.save(output)

