var intervalTime = 1100; //监控频率
var is_start = true; //已经开始监控

function monitor_task() {
	if (is_start) {
		get_server_data();
    }
	else {
		setTimeout(monitor_task, intervalTime);
	}
}

function sec_2_hour(sec) {
	var h = parseInt(sec / 3600);
	var m = parseInt((sec - h * 3600) / 60)
	var s = sec - h * 3600 - m * 60;
	return h + ':' + m + ':' + s;
}

function fill_data_table(data) {
	var keys = ['redis_version', 'os', 'process_id', 'uptime_in_seconds', 'connected_clients', 'blocked_clients',   
	            'total_connections_received', 'total_commands_processed', 'instantaneous_ops_per_sec', 'rejected_connections', 'expired_keys', 'evicted_keys', 'keyspace_hits', 'keyspace_misses']
	var key = null;
	for (var i in keys) {
		key = keys[i];
		if (key == 'uptime_in_seconds') {
			$('#' + key).text(sec_2_hour(data[key]));
		}
		else {
			$('#' + key).text(data[key]);
		}
	}
	
	//遍历key中以db开头的，标示不同的数据库
	var html = "";
	for (var key in data) {
		if (key.substring(0, 2) == 'db') {
			html = html + '<tr class="rb_td"><td colspan="2">'+key+'</td><td colspan="2">'+data[key].keys+'</td><td colspan="2">'+data[key].expires+'</td><td colspan="2">'+data[key].avg_ttl+'</td></tr>';
		}
	}
	//删除已有的，append新增的
	$('tr.rb_td').remove();
	$('#data_table tbody').append(html);
}

function get_server_data() {
	var ajax = $.ajax({
		type: "POST",
		url: '/redis_information.json',
		timeout: 5000,
		data: {'host': redis_info['host'], 'port': redis_info['port'], 'password': redis_info['password']},
		success: function(data) {
			var x_date = (new Date()).toLocaleTimeString().replace(/^\D*/,'');
			if (data.success == 1) {
				fill_data_table(data.data);
				//update charts
				timechart.addData([
				   [
                      0,        // 系列索引
                      data.data.get_time,
                      false,
                      false,
                      x_date
                   ]
                ]);
				opschart.addData([
				   [
                      0,
                      data.data.instantaneous_ops_per_sec,
                      false,
                      false,
                      x_date
                   ]
                ]);
				memchart.addData([
				   [
                      0,
                      (data.data.used_memory / 1024).toFixed(2),
                      false,
                      false,
                      x_date
                   ],[
                      1,
                      (data.data.used_memory_rss / 1024).toFixed(2),
                      false,
                      false,
                      x_date
                   ]
                ]);
				
				cpuchart.addData([
				   [
                      0,
                      data.data.used_cpu_sys,
                      false,
                      false,
                      x_date
                   ],[
                      1,
                      data.data.used_cpu_user,
                      false,
                      false,
                      x_date
                   ],[
                      2,
                      data.data.used_cpu_user_children,
                      false,
                      false,
                      x_date
                   ],[
                      3,
                      data.data.used_cpu_sys_children,
                      false,
                      false,
                      x_date
                   ]
                   
               ]);
			}
			else {
				//填充空的数据
				timechart.addData([[0, 0, false, false, x_date ]])
				opschart.addData([[0, 0, false, false, x_date ]])
				memchart.addData([[0, 0, false, false, x_date ], [0, 1, false, false, x_date ]])
				cpuchart.addData([[0, 0, false, false, x_date ], [0, 1, false, false, x_date ], [0, 2, false, false, x_date ], [0, 3, false, false, x_date ]])
			}
			setTimeout(monitor_task, intervalTime);
		}, 
		dataType: 'json',
		async: true,
	});
}


//line图
function get_line_option(text, subtext, legend, yAxis_name, y_format) {
	option = {
	    title : {
	        text: text,
	        subtext: subtext
	    },
	    tooltip : {
	        trigger: 'axis'
	    },
	    legend: {
	        data:legend
	    },
	    toolbox: {
	        show : true,
	        feature : {
	            mark : {show: true},
	            dataView : {show: true, readOnly: false},
	            magicType : {show: true, type: ['line', 'bar']},
	            restore : {show: true},
	            saveAsImage : {show: true}
	        }
	    },
	    dataZoom : {
	        show : false,
	        start : 0,
	        end : 100
	    },
	    xAxis : [{
            type : 'category',
            boundaryGap : true,
            data : (function (){
                var now = new Date();
                var res = [];
                var len = 100;
                while (len--) {
                    res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                    now = new Date(now - 2000);
                }
                return res;
            })()
	    }],
	    yAxis : [{
            type : 'value',
            scale: true,
            name : yAxis_name,
            axisLabel : {
                formatter: '{value} ' + y_format
            }
        }],
	    series : []
	};
	var tmp = null;
	var s = null;
	for (var i in legend) {
		tmp = legend[i];
		s = {
            name:tmp,
            type:'line',
            data:(function (){
                var res = [];
                var len = 100;
                while (len--) {
                    res.push(0.0);
                }
                return res;
            })()
        }
		option.series.push(s);
	}
	return option;
}

//###########################
var redis_info;

function get_redis_key() {
	var redis_md5 = $('#wrapper').attr('redis_md5');
	redis_md5 = "redis_" + redis_md5;
	return redis_md5
}

function fill_page(key) {
	redis_info = get_redis(key);
	if (redis_info) {
		$('.redis_host_port').text(redis_info['host'] + ':' + redis_info['port']);
		
		//添加其他redis信息
		$('#other_redis li').remove();
		var redis = null;
		var html = '';
		for (var i in redis_servers) {
			redis = redis_servers[i];
			html = '<li><a target="_blank" href="/redis/'+_redis_md5(redis)+'.html">'+ redis['host'] + ':' + redis['port'] +'</a></li>';
			$('#other_redis').append(html);
		}
	}
	else {
		$('#wrapper').html('<h1>不存在这个redis实例。</h1>')
	}
}
//###########################


var echarts = null;

var redis_id = $('#wrapper').attr('redis_index');
var timechart = null;
var opschart = null;
var memchart = null;
var cpuchart = null;
require.config({
    paths: {
        echarts: '/static/res/lib/echarts/'
    }
});
// 按需加载
require([
        'echarts',
        'echarts/chart/line',
        'echarts/chart/bar',
    ],
    function(ec) {
		echarts = ec;
		
		timechart = draw_chart('time_chart', get_line_option('Redis实时联通情况', '', ['连接耗时'], '时间', 'ms'));
		opschart = draw_chart('ops_chart', get_line_option('Redis每秒处理命令数', '', ['OPS'], '命令条数', ''));
		memchart = draw_chart('mem_chart', get_line_option('Redis内存实时占用情况', '', ['Redis内存占用', '系统分配内存'], '内存占用', ' Kb'));
		cpuchart = draw_chart('cpu_chart', get_line_option('Redis实时CPU占用情况', '', ['cpu_user', 'cpu_sys', 'cpu_user_children', 'cpu_sys_children'], 'CPU消耗', ''));
		//开启监控

		load_all_redis_from_storage(); //加载本地数据
		fill_page(get_redis_key());
		monitor_task();
    }
);
function draw_chart(e_id, option) {
	var eChart = echarts.init(document.getElementById(e_id));
	eChart.setOption(option);
	return eChart
}

