rss_src_media = img/news/
rss_dst_media = /Users/boxysean/Documents/workspace/notwork/public/img/news/
rss_src_html = news/
rss_dst_html = /Users/boxysean/Documents/workspace/notwork/public/content/news/

flickr_src = img/flickr
flickr_dst = /Users/boxysean/Documents/workspace/notwork/public/content/photogallery/flickr

xkcd_src = img/xkcd
xkcd_dst = /Users/boxysean/Documents/workspace/notwork/public/content/photogallery/xkcd

RSS = $(addprefix $(rss_src_html)/,$(addsuffix .html,nytimes gothamist boingboing gawker gizmodo laughingsquid github fastcompany villagevoice))

all : rss xkcd

# BUILD IT

$(rss_src_html)/%.html : %.py feed.py
	python $<

rss : $(RSS)

flickr : $(flickr_src) flickr.py
	python flickr.py puppies kittens

xkcd : $(xkcd_src) xkcd.py xkcd.sh
	bash -c "./xkcd.sh"

# INSTALL IT

install : install_rss install_xkcd

install_rss : 
	-rm -r $(rss_dst_media)
	cp -r $(rss_src_media) $(rss_dst_media)
	cp $(rss_src_html)/* $(rss_dst_html)

install_flickr :
	-rm -r $(flickr_dst)
	cp -r $(flickr_src) $(flickr_dst)

install_xkcd :
	-rm -r $(xkcd_dst)
	cp -r $(xkcd_src) $(xkcd_dst)

# CLEAN IT

clean : clean_rss clean_flickr clean_xkcd

clean_rss :
	-rm -r $(rss_src_media)
	-rm -r $(rss_src_html)
	mkdir -p $(rss_src_media)
	mkdir -p $(rss_src_html)

clean_flickr :
	-rm -r $(flickr_src)
	mkdir -p $(flickr_src)

clean_xkcd :
	-rm -r $(xkcd_src)
	mkdir -p $(xkcd_src)

