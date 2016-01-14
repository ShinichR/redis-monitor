#coding=utf-8
'''
Created on 2015年6月16日

@author: hzwangzhiwei
'''
from flask import Flask
import wrapcache
from wrapcache.adapter.MemoryAdapter import MemoryAdapter
from wrapcache.database import LruCacheDB

app = Flask(__name__)
app.secret_key = 'your_session_key_redis_monitor'

MemoryAdapter.db = LruCacheDB(size = 20) #init the store db

from app.views import main_views