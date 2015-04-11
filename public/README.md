- bin/                          # 存放命令行相关代码
	node-echo
+ doc/                          # 存放文档
- lib/                          # 存放API相关代码
	echo.js
- node_modules/                 # 存放三方包
	+ argv/
+ tests/                        # 存放测试用例
package.json                    # 元数据文件
README.md                       # 说明文件

////////////////////////////////////////////////////////////////////////////////////////
小文件拷贝

我们使用NodeJS内置的fs模块简单实现这个程序如下。
	var fs = require('fs');
	function copy(src, dst) {
		fs.writeFileSync(dst, fs.readFileSync(src));
	}

	function main(argv) {
		copy(argv[0], argv[1]);
	}

	main(process.argv.slice(2));
以上程序使用fs.readFileSync从源路径读取文件内容，并使用fs.writeFileSync将文件内容写入目标路径。

////////////////////////////////////////////////////////////////////////////////////////
大文件拷贝

上边的程序拷贝一些小文件没啥问题，但这种一次性把所有文件内容都读取到内存中后再一次性写入磁盘的方式不适合拷贝大文件，内存会爆仓。
对于大文件，我们只能读一点写一点，直到完成拷贝。因此上边的程序需要改造如下:
	var fs = require('fs');
	function copy(src, dst) {
		fs.createReadStream(src).pipe(fs.createWriteStream(dst));
	}

	function main(argv) {
		copy(argv[0], argv[1]);
	}
	main(process.argv.slice(2));
以上程序使用fs.createReadStream创建了一个源文件的只读数据流，
并使用fs.createWriteStream创建了一个目标文件的只写数据流，并且用pipe方法把两个数据流连接了起来。
连接起来后发生的事情，说得抽象点的话，水顺着水管从一个桶流到了另一个桶。

////////////////////////////////////////////////////////////////////////////////////////
Stream（数据流）
当内存中无法一次装下需要处理的数据时，或者一边读取一边处理更加高效时，我们就需要用到数据流。
NodeJS中通过各种Stream来提供对数据流的操作。
以上边的大文件拷贝程序为例，我们可以为数据来源创建一个只读数据流，示例如下：

	var rs = fs.createReadStream(src);
	rs.on('data', function (chunk) {
		rs.pause();//在处理数据前暂停数据读取
		doSomething(chunk, function () {  //doSomething为处理函数
			rs.resume();//在处理数据后继续读取数据。
		});
	});
	rs.on('end', function () {
		cleanUp();
	});
////////////////////////////////////////////////////////////////////////////////////////
	var rs = fs.createReadStream(src);
	var ws = fs.createWriteStream(dst);
	rs.on('data', function (chunk) {
		ws.write(chunk);
	});
	rs.on('end', function () {
		ws.end();
	});
我们把doSomething换成了往只写数据流里写入数据后，以上代码看起来就像是一个文件拷贝程序了。
但是以上代码存在上边提到的问题，如果写入速度跟不上读取速度的话，只写数据流内部的缓存会爆仓。
我们可以根据.write方法的返回值来判断传入的数据是写入目标了，还是临时放在了缓存了，并根据drain事件来判断什么时候只写数据流已经将缓存中的数据写入目标，
可以传入下一个待写数据了。

因此代码可以改造如下：
	var rs = fs.createReadStream(src);
	var ws = fs.createWriteStream(dst);
	rs.on('data', function (chunk) {
		if (ws.write(chunk) === false) {
			rs.pause();
		}
	});
	rs.on('end', function () {
		ws.end();
	});
	ws.on('drain', function () {
		rs.resume();
	});

以上代码实现了数据从只读数据流到只写数据流的搬运，并包括了防爆仓控制。
因为这种使用场景很多，例如上边的大文件拷贝程序，NodeJS直接提供了.pipe方法来做这件事情，其内部实现方式与上边的代码类似。
////////////////////////////////////////////////////////////////////////////////////////
NodeJS通过fs内置模块提供对文件的操作。fs模块提供的API基本上可以分为以下三类：

文件属性读写:
	其中常用的有fs.stat、fs.chmod、fs.chown等等。

文件内容读写:
	其中常用的有fs.readFile、fs.readdir、fs.writeFile、fs.mkdir等等。

底层文件操作:
	其中常用的有fs.open、fs.read、fs.write、fs.close等等。

NodeJS最精华的异步IO模型在fs模块里有着充分的体现，例如上边提到的这些API都通过回调函数传递结果。以fs.readFile为例：

	fs.readFile(pathname, function (err, data) {
		if (err) {
			// Deal with error.
		} else {
			// Deal with data.
		}
	});
如上边代码所示，基本上所有fs模块API的回调参数都有两个。第一个参数在有错误发生时等于异常对象，第二个参数始终用于返回API方法执行结果。
同步API除了方法名的末尾多了一个Sync之外，异常对象与执行结果的传递方式也有相应变化。同样以fs.readFileSync为例：
	try {
		var data = fs.readFileSync(pathname);
		// Deal with data.
	} catch (err) {
		// Deal with error.
	}
////////////////////////////////////////////////////////////////////////////////////////
操作文件时难免不与文件路径打交道。NodeJS提供了path内置模块来简化路径相关操作，并提升代码可读性。以下分别介绍几个常用的API。

path.normalize
//将传入的路径转换为标准路径，具体讲的话，除了解析路径中的.与..外，还能去掉多余的斜杠。
如果有程序需要使用路径作为某些数据的索引，但又允许用户随意输入路径时，就需要使用该方法保证路径的唯一性。以下是一个例子：

	var cache = {};

	function store(key, value) {
	  cache[path.normalize(key)] = value;
	}

	store('foo/bar', 1);
	store('foo//baz//../bar', 2);
	console.log(cache);  // => { "foo/bar": 2 }
	
坑出没注意： 标准化之后的路径里的斜杠在Windows系统下是\，而在Linux系统下是/。
如果想保证任何系统下都使用/作为路径分隔符的话，需要用.replace(/\\/g, '/')再替换一下标准路径。

path.join

将传入的多个路径拼接为标准路径。该方法可避免手工拼接路径字符串的繁琐，并且能在不同系统下正确使用相应的路径分隔符。以下是一个例子：

path.join('foo/', 'baz/', '../bar'); // => "foo/bar"
path.extname

当我们需要根据不同文件扩展名做不同操作时，该方法就显得很好用。以下是一个例子：

path.extname('foo/bar.js'); // => ".js"
////////////////////////////////////////////////////////////////////////////////////////
遍历目录
	同步遍历:
	function travel(dir, callback) {
		fs.readdirSync(dir).forEach(function (file) {
			var pathname = path.join(dir, file);
			if (fs.statSync(pathname).isDirectory()) {
				travel(pathname, callback);
			} else {
				callback(pathname);
			}
		});
	}
	
	异步遍历
	function travel(dir, callback, finish) {
		fs.readdir(dir, function (err, files) {
			(function next(i) {
				if (i < files.length) {
					var pathname = path.join(dir, files[i]);

					fs.stat(pathname, function (err, stats) {
						if (stats.isDirectory()) {
							travel(pathname, callback, function () {
								next(i + 1);
							});
						} else {
							callback(pathname, function () {
								next(i + 1);
							});
						}
					});
				} else {
					finish && finish();
				}
			}(0));
		});
	}
////////////////////////////////////////////////////////////////////////////////////////
文本编码
BOM用于标记一个文本文件使用Unicode编码，其本身是一个Unicode字符（"\uFEFF"），位于文本文件头部。
在不同的Unicode编码下，BOM字符对应的二进制字节如下：

		Bytes      Encoding
	----------------------------
		FE FF       UTF16BE
		FF FE       UTF16LE
		EF BB BF    UTF8

使用NodeJS读取文本文件时，一般需要去掉BOM。例如，以下代码实现了识别和去除UTF8 BOM的功能。
	function readText(pathname) {
		var bin = fs.readFileSync(pathname);

		if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
			bin = bin.slice(3);
		}

		return bin.toString('utf-8');
	}

GBK转UTF8
NodeJS支持在读取文本文件时，或者在Buffer转换为字符串时指定文本编码，但遗憾的是，GBK编码不在NodeJS自身支持范围内。因此，一般我们借助iconv-lite这个三方包来转换编码。使用NPM下载该包后，我们可以按下边方式编写一个读取GBK文本文件的函数。
	var iconv = require('iconv-lite');
	function readGBKText(pathname) {
		var bin = fs.readFileSync(pathname);

		return iconv.decode(bin, 'gbk');
	}
////////////////////////////////////////////////////////////////////////////////////////
不管大于0xEF的单个字节在单字节编码下被解析成什么乱码字符，使用同样的单字节编码保存这些乱码字符时，背后对应的字节保持不变。

NodeJS中自带了一种binary编码可以用来实现这个方法，因此在下例中，我们使用这种编码来演示上例对应的代码该怎么写。
	function replace(pathname) {
		var str = fs.readFileSync(pathname, 'binary');
		str = str.replace('foo', 'bar');
		fs.writeFileSync(pathname, str, 'binary');
	}
////////////////////////////////////////////////////////////////////////////////////////
NodeJS本来的用途是编写高性能Web服务器。我们首先在这里重复一下官方文档里的例子，使用NodeJS内置的http模块简单实现一个HTTP服务器。

HTTP请求本质上是一个数据流，由请求头（headers）和请求体（body）组成。例如以下是一个完整的HTTP请求数据内容。
	POST / HTTP/1.1
	User-Agent: curl/7.26.0
	Host: localhost
	Accept: */*
	Content-Length: 11
	Content-Type: application/x-www-form-urlencoded

	Hello World
	
HTTP响应本质上也是一个数据流，同样由响应头（headers）和响应体（body）组成。例如以下是一个完整的HTTP请求数据内容。
	HTTP/1.1 200 OK
	Content-Type: text/plain
	Content-Length: 11
	Date: Tue, 05 Nov 2013 05:31:38 GMT
	Connection: keep-alive

	Hello World
---------------------------------------------------------------------
作为服务端使用时，创建一个HTTP服务器，监听HTTP客户端请求并返回响应。
	var http = require('http');
	http.createServer(function (request, response) {
		var body = [];

		console.log(request.method);
		console.log(request.headers);

		request.on('data', function (chunk) {
			body.push(chunk);
		});

		request.on('end', function () {
			body = Buffer.concat(body);
			console.log(body.toString());
		});
		response.writeHead(200, { 'Content-Type': 'text-plain' });
		response.end('Hello World\n');
	}).listen(8124);
	-------------------------------------------
	POST
	{
		'user-agent': 'curl/7.26.0',
		host: 'localhost',
		accept: '*/*',
		'content-length': '11',
		'content-type': 'application/x-www-form-urlencoded'
	}
	Hello World
---------------------------------------------------------------------
作为客户端使用时，发起一个HTTP客户端请求，获取服务端响应。
	var options = {
        hostname: 'www.example.com',
        port: 80,
        path: '/upload',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

	var request = http.request(options, function (response) {});

	request.write('Hello World');
	request.end();
	
	HTTP请求中GET请求是最常见的一种，并且不需要请求体，因此http模块也提供了以下便捷API。
		当客户端发送请求并接收到完整的服务端响应头时，就会调用回调函数。
		在回调函数中，除了可以使用response对象访问响应头数据外，还能把response对象当作一个只读数据流来访问响应体数据。
		以下是一个例子。
		http.get('http://www.example.com/', function (response) {
			var body = [];

			console.log(response.statusCode);
			console.log(response.headers);

			response.on('data', function (chunk) {
				body.push(chunk);
			});

			response.on('end', function () {
				body = Buffer.concat(body);
				console.log(body.toString());
			});
		});

		------------------------------------
		200
		{ 'content-type': 'text/html',
		  server: 'Apache',
		  'content-length': '801',
		  date: 'Tue, 05 Nov 2013 06:08:41 GMT',
		  connection: 'keep-alive' }
		<!DOCTYPE html>
		...
---------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////
HTTPS
在服务端模式下，创建一个HTTPS服务器的示例如下。
		var options = {
			key: fs.readFileSync('./ssl/default.key'),
			cert: fs.readFileSync('./ssl/default.cer')
		};

		var server = https.createServer(options, function (request, response) {
			// ...
		});
	可以看到，与创建HTTP服务器相比，多了一个options对象，通过key和cert字段指定了HTTPS服务器使用的私钥和公钥。
	
	另外，NodeJS支持SNI技术，可以根据HTTPS客户端请求使用的域名动态使用不同的证书，因此同一个HTTPS服务器可以使用多个域名提供服务。
	接着上例，可以使用以下方法为HTTPS服务器添加多组证书。
		server.addContext('foo.com', {
			key: fs.readFileSync('./ssl/foo.com.key'),
			cert: fs.readFileSync('./ssl/foo.com.cer')
		});

		server.addContext('bar.com', {
			key: fs.readFileSync('./ssl/bar.com.key'),
			cert: fs.readFileSync('./ssl/bar.com.cer')
		});
		
在客户端模式下，发起一个HTTPS客户端请求与http模块几乎相同，示例如下。
	var options = {
			hostname: 'www.example.com',
			port: 443,
			path: '/',
			method: 'GET'
		};

	var request = https.request(options, function (response) {});

	request.end();
	但如果目标服务器使用的SSL证书是自制的，不是从颁发机构购买的，默认情况下https模块会拒绝连接，提示说有证书安全问题。
	在options里加入rejectUnauthorized: false字段可以禁用对证书有效性的检查，从而允许https模块请求开发环境下使用自制证书的HTTPS服务器。
////////////////////////////////////////////////////////////////////////////////////////
URL
								   href
	 -----------------------------------------------------------------
								host              path
						  --------------- ----------------------------
	 http: // user:pass @ host.com : 8080 /p/a/t/h ?query=string #hash
	 -----    ---------   --------   ---- -------- ------------- -----
	protocol     auth     hostname   port pathname     search     hash
													------------
													   query
													   
url.parse
	我们可以使用.parse方法来将一个URL字符串转换为URL对象，示例如下:
		url.parse('http://user:pass@host.com:8080/p/a/t/h?query=string#hash');
		/*
			{
				protocol: 'http:',
				auth: 'user:pass',
				host: 'host.com:8080',
				port: '8080',
				hostname: 'host.com',
				hash: '#hash',
				search: '?query=string',
				query: 'query=string',
				pathname: '/p/a/t/h',
				path: '/p/a/t/h?query=string',
				href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'
			}
		*/
	传给.parse方法的不一定要是一个完整的URL，例如在HTTP服务器回调函数中，request.url不包含协议头和域名，但同样可以用.parse方法解析。
		http.createServer(function (request, response) {
			var tmp = request.url; // => "/foo/bar?a=b"
			url.parse(tmp);
			/* =>
			{ protocol: null,
			  slashes: null,
			  auth: null,
			  host: null,
			  port: null,
			  hostname: null,
			  hash: null,
			  search: '?a=b',
			  query: 'a=b',
			  pathname: '/foo/bar',
			  path: '/foo/bar?a=b',
			  href: '/foo/bar?a=b' }
			*/
		}).listen(80);
		.parse方法还支持第二个和第三个布尔类型可选参数。
		第二个参数等于true时，该方法返回的URL对象中，query字段不再是一个字符串，而是一个经过querystring模块转换后的参数对象。
		第三个参数等于true时，该方法可以正确解析不带协议头的URL，例如//www.example.com/foo/bar。
		
url.format
	反过来，format方法允许将一个URL对象转换为URL字符串，示例如下。
		url.format({
			protocol: 'http:',
			host: 'www.example.com',
			pathname: '/p/a/t/h',
			search: 'query=string'
		});
		/* =>
			'http://www.example.com/p/a/t/h?query=string'
		*/
		
url.resolve
	url.resolve('http://www.example.com/foo/bar', '../baz');
	/*
		http://www.example.com/baz
	*/
	
querystring模块用于实现URL参数字符串与参数对象的互相转换，示例如下。
	querystring.parse('foo=bar&baz=qux&baz=quux&corge');
	/* =>
	{ foo: 'bar', baz: ['qux', 'quux'], corge: '' }
	*/

	querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'], corge: '' });
	/* =>
	'foo=bar&baz=qux&baz=quux&corge='
	*/
////////////////////////////////////////////////////////////////////////////////////////
zlib模块提供了数据压缩和解压的功能。当我们处理HTTP请求和响应时，可能需要用到这个模块。

首先我们看一个使用zlib模块压缩HTTP响应体数据的例子。这个例子中，判断了客户端是否支持gzip，并在支持的情况下使用zlib模块返回gzip之后的响应体数据。
	http.createServer(function (request, response) {
		var i = 1024,
			data = '';

		while (i--) {
			data += '.';
		}

		if ((request.headers['accept-encoding'] || '').indexOf('gzip') !== -1) {
			zlib.gzip(data, function (err, data) {
				response.writeHead(200, {
					'Content-Type': 'text/plain',
					'Content-Encoding': 'gzip'
				});
				response.end(data);
			});
		} else {
			response.writeHead(200, {
				'Content-Type': 'text/plain'
			});
			response.end(data);
		}
	}).listen(80);
接着我们看一个使用zlib模块解压HTTP响应体数据的例子。这个例子中，判断了服务端响应是否使用gzip压缩，并在压缩的情况下使用zlib模块解压响应体数据。
	var options = {
			hostname: 'www.example.com',
			port: 80,
			path: '/',
			method: 'GET',
			headers: {
				'Accept-Encoding': 'gzip, deflate'
			}
		};

	http.request(options, function (response) {
		var body = [];

		response.on('data', function (chunk) {
			body.push(chunk);
		});

		response.on('end', function () {
			body = Buffer.concat(body);

			if (response.headers['content-encoding'] === 'gzip') {
				zlib.gunzip(body, function (err, data) {
					console.log(data.toString());
				});
			} else {
				console.log(data.toString());
			}
		});
	}).end();
////////////////////////////////////////////////////////////////////////////////////////
net模块可用于创建Socket服务器或Socket客户端。
由于Socket在前端领域的使用范围还不是很广，这里先不涉及到WebSocket的介绍，仅仅简单演示一下如何从Socket层面来实现HTTP请求和响应。
首先我们来看一个使用Socket搭建一个很不严谨的HTTP服务器的例子。这个HTTP服务器不管收到啥请求，都固定返回相同的响应。
	net.createServer(function (conn) {
		conn.on('data', function (data) {
			conn.write([
				'HTTP/1.1 200 OK',
				'Content-Type: text/plain',
				'Content-Length: 11',
				'',
				'Hello World'
			].join('\n'));
		});
	}).listen(80);

接着我们来看一个使用Socket发起HTTP客户端请求的例子。
这个例子中，Socket客户端在建立连接后发送了一个HTTP GET请求，并通过data事件监听函数来获取服务器响应。
	var options = {
			port: 80,
			host: 'www.example.com'
		};

	var client = net.connect(options, function () {
		client.write([
			'GET / HTTP/1.1',
			'User-Agent: curl/7.26.0',
			'Host: www.baidu.com',
			'Accept: */*',
			'',
			''
		].join('\n'));
	});

	client.on('data', function (data) {
		console.log(data.toString());
		client.end();
	});

灵机一点

使用NodeJS操作网络，特别是操作HTTP请求和响应时会遇到一些惊喜，这里对一些常见问题做解答。

问： 为什么通过headers对象访问到的HTTP请求头或响应头字段不是驼峰的？
答： 从规范上讲，HTTP请求头和响应头字段都应该是驼峰的。
	但现实是残酷的，不是每个HTTP服务端或客户端程序都严格遵循规范，
	所以NodeJS在处理从别的客户端或服务端收到的头字段时，都统一地转换为了小写字母格式，
	以便开发者能使用统一的方式来访问头字段，例如headers['content-length']。

问： 为什么http模块创建的HTTP服务器返回的响应是chunked传输方式的？
答： 因为默认情况下，使用.writeHead方法写入响应头后，允许使用.write方法写入任意长度的响应体数据，并使用.end方法结束一个响应。
	由于响应体数据长度不确定，因此NodeJS自动在响应头里添加了Transfer-Encoding: chunked字段，并采用chunked传输方式。
	但是当响应体数据长度确定时，可使用.writeHead方法在响应头里加上Content-Length字段，
	这样做之后NodeJS就不会自动添加Transfer-Encoding字段和使用chunked传输方式。

问： 为什么使用http模块发起HTTP客户端请求时，有时候会发生socket hang up错误？
答： 发起客户端HTTP请求前需要先创建一个客户端。
	http模块提供了一个全局客户端http.globalAgent，可以让我们使用.request或.get方法时不用手动创建客户端。
	但是全局客户端默认只允许5个并发Socket连接，
	当某一个时刻HTTP客户端请求创建过多，超过这个数字时，就会发生socket hang up错误。
	解决方法也很简单，通过http.globalAgent.maxSockets属性把这个数字改大些即可。
	另外，https模块遇到这个问题时也一样通过https.globalAgent.maxSockets属性来处理。
////////////////////////////////////////////////////////////////////////////////////////