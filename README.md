## redis-monitor ##

A web visualization redis monitoring program. Performance optimized and very easy to install and deploy, base on Flask and sqlite. the monitor data come from redis.info().

Welcome to issue and push request. [https://github.com/hustcc/redis-monitor](https://github.com/hustcc/redis-monitor) 

### What ###

The monitor data include: ga

 - the redis server infomation, include redis version, online time, online time, os version and information, and so on.
 - the realtime cmd exec infomation, such as ops, connected count, and so on.
 - the realtime gragh of the connect time.
 - the realtime graph of ops.
 - the realtime grash of cpu and mem usage.
 - some simple operate, such as flushdb and add key-velue.
 
 
### Why ###

There are so many redis monitor code in github, why do this?

Because I clone so many program, but all exist difficult, cause by below:

 - My kownleage is pool.
 - The config not easy, I have do many thing to run the code, and I need to rewrite some code on my dev environment.
 - Incompatible versions, I can run to monitor redis 2.6, but not work with 2.8.
 - Start up not easy, some project, I need to run a data collection process, and a web process.
 - Performance Loss, when I open 10 browser tab, the monitor can u

### How to Use ###

1. git clone https://github.com/hustcc/redis-monitor.git
2. install the environment, so easy, if you are a pythoner, I believe you can skip this step.

	> pip install Flask
	
	> pip install requests
	
	> pip install redis
	
	> install sqlite3 environment, linux include.

3. start up

	> ./run_monitor
	
	or
	
	> python run_monitor.py
	
	PS: change run_monitor mode to 755.

4. Open in browser 127.0.0.1:7259, then you will see it.

### screenshot ###

 - basic information

![shot_1](/doc/shot/shot_1.png)

 - connection time gragh

![shot_2](/doc/shot/shot_2.png)

 - ops time gragh

![shot_3](/doc/shot/shot_3.png)

 - cpu and mem

![shot_3](/doc/shot/shot_4.png)

