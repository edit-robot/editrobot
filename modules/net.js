var net = require('net');
var fs = require('fs');
var path = require("path");
var http = require("http");
var HTTPS = require("https");
var URL = require("url");
var querystring=require("querystring");

var Interface = function(){};

//文件拷贝
Interface.prototype.client_get = function (url,callback) {
	var url_obj = URL.parse(url,true);//生成url对象
	
	console.log(url_obj.hostname);
	console.log(url_obj.port);
	console.log(url_obj.pathname);
	console.log(url_obj.query);
	console.log(url_obj.path);
	
	var options = {
        port: url_obj.port,
        host: url_obj.hostname
    };

	var client = net.connect(options, function () {
			client.write([
				"GET "+url_obj.path+" HTTP/1.1",
				'User-Agent: curl/7.26.0',
				'Host: '+url_obj.hostname,
				'Accept: */*',
				'Connection: Keep-Alive',
				'',
				''
			].join('\n'));
		});

	client.on('data', function (data) {
		var data_temp = data.toString();
		var data_temp_array = data_temp.split('\n\r');
		var head = data_temp_array[0];
		data_temp_array[0] = null;
		var body = data_temp_array.join('\n\r');
		
		//console.log(data_temp_array.join('\n\r'));
		client.end();
		callback(head,body);
	});
};

var get_login = function(url, cb){
	var url_obj = URL.parse(url);
	var __http = url_obj.protocol ==="https:"? HTTPS : http;
	__http.get(url, function(res){
		res.setEncoding("utf8");
		var res_body ="";
		res.on("data", function(chunk) {
			res_body += chunk;
		});
		res.on("end", function() {
			var cook = res.headers["set-cookie"];
			
			var cookie_obj = {
				"JSESSIONID": cook[0].split(";")[0].split("=")[1],
				"yht_vote_cookie_name": cook[0].split(";")[1].split("=")[1]
			};
			cb(null,cook, cookie_obj, res_body);
		});
		res.on("error", function(err2){
			cb(err2);
		});
	});
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
Interface.prototype.client_post = function (fileKeyValue, options,callback) {
	var req = http.request(options, function(res){
		console.log("RES:" + res);
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding("utf8");
		res.on("data", function(chunk){
			console.log();
			console.log("BODY:" + chunk);
		})
	});
	var boundaryKey = Math.random().toString(16);
	var enddata = '\r\n----' + boundaryKey + '--';

	var files = new Array();
	for (var i = 0; i < fileKeyValue.length; i++) {
		var content = "\r\n----" + boundaryKey + "\r\n" + "Content-Type: application/octet-stream\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].urlKey + "\"; filename=\"" + path.basename(fileKeyValue[i].urlValue) + "\"\r\n" + 
		"Content-Transfer-Encoding: binary\r\n\r\n";
		var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
		files.push({contentBinary: contentBinary, filePath: fileKeyValue[i].urlValue});
	}
	var contentLength = 0;
	for (var i = 0; i < files.length; i++) {
		var stat = fs.statSync(files[i].filePath);
		contentLength += files[i].contentBinary.length;
		contentLength += stat.size;
	}

	req.setHeader('Content-Type', 'multipart/form-data; boundary=--' + boundaryKey);
	req.setHeader('Content-Length', contentLength + Buffer.byteLength(enddata));

	// 将参数发出
	var fileindex = 0;
	var doOneFile = function(){
		req.write(files[fileindex].contentBinary);
		var fileStream = fs.createReadStream(files[fileindex].filePath, {bufferSize : 4 * 1024});
		fileStream.pipe(req, {end: false});
		fileStream.on('end', function() {
			fileindex++;
			if(fileindex == files.length){
				req.end(enddata);
			} else {
				doOneFile();
			}
		});
	};
	if(fileindex == files.length){
		req.end(enddata);
	} else {
		doOneFile();
	}
	callback();
};
// var files = [
		// {
			// urlKey: "images",
			// urlValue: (this.project_path(__dirname,"weixin")+"\\temp\\2.jpg").replace(/\\/g, '/')
		// }
	// ];

	// var options = {
		// host: "localhost",
		// port: "80",
		// method: "POST",
		// path: "/uploader/s_upload.php?a=b&b=c"
	// }
	
	// net.client_post(files,options,function(){});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = new Interface();