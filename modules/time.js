var Interface = function(){};

Interface.prototype.timestamp = function () {
	return Date.parse(new Date());
};

Interface.prototype.getMonth = function () {
	return (new Date().getMonth())+1;
};

Interface.prototype.getDate = function () {
	return (new Date().getDate());
};

Interface.prototype.getHours = function () {
	return (new Date().getHours());
};

Interface.prototype.getMinutes = function () {
	return (new Date().getMinutes());
};

Interface.prototype.getSeconds = function () {
	return (new Date().getSeconds());
};

Interface.prototype.getMilliseconds = function () {
	return (new Date().getMilliseconds());
};

module.exports = new Interface();

/*
Date 对象的方法
    FF: Firefox, N: Netscape, IE: Internet Explorer
    方法 描述 FF N IE
    Date()	返回当日的日期和时间	1	2	3
    getDate()	从 Date 对象返回一个月中的某一天 (1 ~ 31)	1	2	3
    getDay()	从 Date 对象返回一周中的某一天 (0 ~ 6)	1	2	3
    getMonth()	从 Date 对象返回月份 (0 ~ 11)	1	2	3
    getFullYear()	从 Date 对象以四位数字返回年份	1	4	4
    getYear()	从 Date 对象以两位或四位数字返回年份。	1	2	3
    getHours()	返回 Date 对象的小时 (0 ~ 23)	1	2	3
    getMinutes()	返回 Date 对象的分钟 (0 ~ 59)	1	2	3
    getSeconds()	返回 Date 对象的秒数 (0 ~ 59))	1	2	3
    getMilliseconds()	返回 Date 对象的毫秒(0 ~ 999)	1	4	4
    getTime()	返回 1970 年 1 月 1 日至今的毫秒数	1	2	3
    getTimezoneOffset()	返回本地时间与格林威治标准时间的分钟差 (GMT)	1	2	3
    getUTCDate()	根据世界时从 Date 对象返回月中的一天 (1 ~ 31)	1	4	4
    getUTCDay()	根据世界时从 Date 对象返回周中的一天 (0 ~ 6)	1	4	4
    getUTCMonth()	根据世界时从 Date 对象返回月份 (0 ~ 11)	1	4	4
    getUTCFullYear()	根据世界时从 Date 对象返回四位数的年份	1	4	4
    getUTCHours()	根据世界时返回 Date 对象的小时 (0 ~ 23)	1	4	4
    getUTCMinutes()	根据世界时返回 Date 对象的分钟 (0 ~ 59)	1	4	4
    getUTCSeconds()	根据世界时返回 Date 对象的秒钟 (0 ~ 59)	1	4	4
    getUTCMilliseconds()	根据世界时返回 Date 对象的毫秒(0 ~ 999)	1	4	4
    parse()	返回1970年1月1日午夜到指定日期（字符串）的毫秒数	1	2	3
    setDate()	设置 Date 对象中月的某一天 (1 ~ 31))	1	2	3
    setMonth()	设置 Date 对象中月份 (0 ~ 11))	1	2	3
    setFullYear()	设置 Date 对象中的年份（四位数字）	1	4	4
    setYear()	设置 Date 对象中的年份（两位或四位数字）。	1	2	3
    setHours()	设置 Date 对象中的小时 (0 ~ 23)	1	2	3
    setMinutes()	设置 Date 对象中的分钟 (0 ~ 59)	1	2	3
    setSeconds()	设置 Date 对象中的秒钟 (0 ~ 59)	1	2	3
    setMilliseconds()	设置 Date 对象中的毫秒 (0 ~ 999)	1	4	4
    setTime()	通过向或从1970年1月1日午夜添加或减去指定数目的毫秒来计算日期和时间	1	2	3
    setUTCDate()	根据世界时设置 Date 对象中月份的一天 (1 ~ 31)	1	4	4
    setUTCMonth()	根据世界时设置 Date 对象中的月份 (0 ~ 11)	1	4	4
    setUTCFullYear()	根据世界时设置 Date 对象中年份（四位数字）	1	4	4
    setUTCHours()	根据世界时设置 Date 对象中小时 (0 ~ 23)	1	4	4
    setUTCMinutes()	根据世界时设置 Date 对象中分钟 (0 ~ 59)	1	4	4
    setUTCSeconds()	根据世界时设置 Date 对象中秒钟 (0 ~ 59)	1	4	4
    setUTCMilliseconds()	根据世界时设置 Date 对象中毫秒S(0 ~ 999)	1	4	4
    toSource()	代表对象的源代码	1	4	-
    toString()	把 Date 对象转换为字符串。	1	2	4
    toTimeString()	把 Date 对象的时间部分转换为字符串。	1	2	4
    toDateString()	把 Date 对象的日期部分转换为字符串。	1	2	4
    toGMTString()	根据格林威治时间，把 Date 对象转换为字符串。	1	2	3
    toUTCString()	根据世界时，把 Date 对象转换为字符串。	1	4	4
    toLocaleString()	根据本地时间格式，把 Date 对象转换为字符串。	1	2	3
    toLocaleTimeString()	根据本地时间格式，把 Date 对象的时间部分转换为字符串	1	2	3
    toLocaleDateString()	根据本地时间格式，把 Date 对象的日期部分转换为字符串	1	2	3
    UTC()	根据世界时，获得一个日期，然后返回1970年1月1日午夜到该日期的毫秒数。	1	2	3
    valueOf()	返回 Date 对象的原始值。	1	2	4
    Date 对象的属性
    FF: Firefox, N: Netscape, IE: Internet Explorer
    属性 描述 FF N IE 
    constructor	一个对创建对象的函数的引用	1	4	4
    prototype	使您有能力向对象添加属性和方法	1	3	4
*/