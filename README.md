# tum-lecture-download

# :warning: This repository is not active anymore. Feel free to use [github.com/Valentin-Metz/tum_video_scraper](https://github.com/Valentin-Metz/tum_video_scraper) :warning:

> Download lecture recordings from streams.tum.de and lecturio

## Install
[![](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/tum-lecture-download/jlbncgdbgjgdimjnihmniommnbhddajf) [![](https://addons.cdn.mozilla.net/static/img/addons-buttons/AMO-button_1.png)](https://addons.mozilla.org/en-US/firefox/addon/tum-lecture-download/)


## Usage
![](https://s3.amazonaws.com/lukaskollmer/embed/tum-lecture-download.png)


## Lecture Slides
Some lecture recordings on streams.tum.de that include slides don't upload them as a single video stream, but rather as a sequence of many individual images.  
The chrome extension can detect this and will show a notice if slides are available.

If you prefix the lecture name with an exclamation mark (!), the extension will download these slide images.  
You can then use the [`process_slides`](process_slides.py) Python script to turn these individual slides into a video file.
The script will adjust how long each slide is shown, so that the slides video is in sync with the main lecture recording.

## License
MIT @ [Lukas Kollmer](https://lukaskollmer.me)
