import requests
import sys
import os
from PIL import Image
from StringIO import StringIO
import shutil

# image download
def download_image(url,header, timeout = 10):
    response = requests.get(url, headers=header,allow_redirects=False, timeout=timeout)
    if response.status_code != 200:
        e = Exception("HTTP status: " + response.status_code)
        raise e

    content_type = response.headers["content-type"]
    if 'image' not in content_type:
        e = Exception("Content-Type: " + content_type)
        raise e

    return response

# set filename
def make_filename(base_dir, number, url):
    ext = os.path.splitext(url)[1] # kakutyoushi
    filename = number + ext        # number+kakutyoushi

    #fullpath = os.path.join(base_dir, filename)
    fullpath=filename
    return fullpath

def save_image(filename, r):
    #with open(filename, "wb") as fout:
    #   fout.write(image)

    #with open(filename, 'wb') as f:
        #r.content.raw.decode_content = True
        #shutil.copyfileobj(r.raw, f)
    i = Image.open(StringIO(r.content))
    i.save(filename)
def test():
    args = sys.argv

    headers = {'User-Agent': 'Sample Header'}
    url = "https://api.line.me/v2/bot/message/{mid}/content"
    print len(args)
    if len(args)<=1:
        print "error:please set args1 return"
        return
    url=url.replace("{mid}",args[1])

    accessToken=os.getenv("CHANNEL_ACCESS_TOKEN", "none")
    if accessToken=="none":
        print "error:AccessToken not Set"
        return
    headerparam="Bearer "+accessToken
    print headerparam


