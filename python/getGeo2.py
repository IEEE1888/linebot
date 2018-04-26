#coding: utf-8
import sys
from pygeocoder import Geocoder
import urllib
import os

#args 場所（日本語）,ファイル名
args=sys.argv
address = args[1]
results = Geocoder.geocode(address)
print(results[0].coordinates)
f=open('../local/location/loc2.txt','w')
f.write(results[0].coodinates)
f.close()
