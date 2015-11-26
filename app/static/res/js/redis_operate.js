function http_post(url, data, type, success_func) {
	var ajax = $.ajax({
		type: type,
		url: url,
		timeout: 5000,
		data: data,
		success: success_func, 
		dataType: 'json',
		async: true,
	});
}

//清空db
function flush_redis(md5, db) {
	http_post('/api/redis/flushall', {'md5': md5, 'db': db}, "POST", function (d) {
		if (d.success == 1) {
			//flush success， waiting to refresh the webpage
		}
		else {
			alert(d.data);
		}
	});
}