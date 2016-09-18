#coding=utf-8
'''
Created on 2015年11月24日

@author: hustcc
'''
from app.dbs.sqlite_utils import SqliteHandler
from app.utils import StringUtil, DateUtil
import time


def get_all_redis():
    '''
    info: 获取数据库中所有的redis信息
    '''
    sql = "select * from redis_info order by add_time desc;"
    params = ()
    return SqliteHandler().exec_select(sql, params)


def add_redis(host, port, psw, email):
    '''
    info: 添加一个redis信息到数据库
    '''
    global redis_cache
    
    add_time = DateUtil.now_datetime()
    md5 = StringUtil.md5(host + str(port))
    r = get_redis(md5)
    redis_cache = {} #清楚缓存
    if r:
        #存在，update
        sql = "update redis_info set redis_host = ?, redis_port = ?, redis_pass = ?, email = ?, add_time = ? where md5 = ?"
        params = (host, port, psw, email, add_time, md5)
        return SqliteHandler().exec_update(sql, params)
    else:
        sql = "insert into redis_info (redis_host, redis_port, redis_pass, email, add_time, md5) values (?, ?, ?, ?, ?, ?)"
        params = (host, port, psw, email, add_time, md5)
        return SqliteHandler().exec_insert(sql, params)
    

def delete_redis(md5):
    '''
    info: delete redis information from db
    '''
    global redis_cache
    redis_cache = {}
    sql = "delete from redis_info where md5 = ?"
    params = (md5, )
    return SqliteHandler().exec_update(sql, params)

redis_cache = {

}

cache_timeout = 60 # 1 min
def get_redis(md5, cache = True):
    '''
    info: get one redis information
    add db cache, because the data is request so many time
    '''
    r_info = None
    
    global redis_cache, cache_timeout
    if cache:
        redis_info = redis_cache.get(md5, None)
        if md5 in redis_cache.keys() and redis_info and time.time() - redis_info.get('time', 0) <= cache_timeout:
            r_info = redis_info.get('data', None)
            return r_info
    #每次timeout的时候，清点缓存，防止内存泄露
    keys = redis_cache.keys()
    for k in keys:
        curr = time.time()
        r = redis_cache.get(k)
        if r and curr - r.get('time', 0) > cache_timeout:
            redis_cache.pop(k)

    sql = "select * from redis_info where md5 = ?"
    params = (md5, )
    r_info = SqliteHandler().exec_select_one(sql, params)
    redis_info = {
        'time': time.time(),
        'data': r_info
    }
    redis_cache[md5] = redis_info
    return r_info


def create_tables():
    '''
    info:创建表结构，第一次初始化的时候使用
    '''
    sql = ("create table redis_info("
           "redis_host varchar, "
           "redis_port varchar, "
           "redis_pass varchar, "
           "add_time varchar, "
           "email varchar, "
           "md5 varchar)")
    
    SqliteHandler().exec_sql(sql, ())
    
if __name__ == '__main__':
    create_tables()