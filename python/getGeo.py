#coding: utf-8
import sys
from pygeocoder import Geocoder
import urllib
import os
from PIL import Image

#args 場所（日本語）,ファイル名
args=sys.argv
address = args[1]
results = Geocoder.geocode(address)
print(results[0].coordinates)


def download_pic(url,filename):
	img = urllib.urlopen(url)
	localfile = open( "./" + str(filename) + ".png" , 'wb')
	localfile.write(img.read())
	img.close()
	localfile.close()


result = Geocoder.reverse_geocode(*results.coordinates, language="ja")
print result
key=os.getenv("GOOGLEAPIKEYGEO")
html1 = "https://maps.googleapis.com/maps/api/staticmap?center="
html2 = "&maptype=hybrid&size=640x480&sensor=false&zoom=18&markers="
html3 = "&key="+key
axis = str((results[0].coordinates)[0]) + "," + str((results[0].coordinates)[1])

html = html1 + axis + html2 + axis + html3

print html

download_pic(html,args[2])

#img= Image.open("./"+args[2]+".png")
#img.save("./"+arg[2]+".jpg","
