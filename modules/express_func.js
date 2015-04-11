var express = require('express');
var file = require('./file.js');
var fs = require('fs');
var os = require('os');
var time = require('./time.js');
var http = require('http');
var nosql = require('./nosql.js');
var config = require("../lib/config")();
////////////////////////////////////////////////////////////////////////////////////
//该处为C++模块
////////////////////////////////////////////////////////////////////////////////////
global.project_name = "";
global.project_root_path = process.cwd();
global.language = "chinaese";
global.session = "temp_session";
global.db_path = "db";
global.clean_session = 0;
////////////////////////////////////////////////////////////////////////////////////
var Interface = function () {
};

//主机信息
Interface.prototype.host_info = function () {
    return {
        "tmpdir": os.tmpdir(),//操作系统临时文件夹
        "hostname": os.hostname(),//主机名
        "type": os.type(),//操作系统类型
        "platform": os.platform(),//操作系统平台
        "arch": os.arch(),//cpu架构
        "release": os.release(),//操作系统的release版本号
        "uptime": os.uptime(),//系统从启动到方法执行共经历多长时间
        "loadavg": os.loadavg(),//返回一个数据，数据元素依次为1分钟5分钟和15分钟的平均负载
        "totalmem": os.totalmem(),//内存总数，单位字节
        "freemem": os.freemem(),//剩余可用内存空间
        "EOL": os.EOL,//系统的行结束符是什么，windows为\r\n，unix和unix-like为\n，mac和ios为\r
        "cpus": os.cpus(),//返回一个数组，数组每个元素为一个cpu核心的信息。
        "networkInterfaces": os.networkInterfaces() //返回一个二维数组，每一个内层数组代表一个网络接口（物理网卡或者虚拟网卡）
    };
};

//登录信息管理器
Interface.prototype.login_handle_manage = function (req, res, callback) {
    console.log("login_handle_manage");
    var project_root_path = global.project_root_path;
    file.travel_dir(project_root_path + "/" + global.session, function (pathname) {
        console.log("pathname:", pathname);
        var db_handle = JSON.parse(file.file_read(pathname).toString('utf-8'));
        console.log("update_time:", db_handle.update_time);
        if (2000000 < (time.timestamp() - db_handle.update_time)) {
            file.file_del(pathname);
        }
    });

    console.log("out if:req.cookies.name-" + req.cookies.name);
    if (typeof req.cookies.name != "undefined") {
        callback(req, res, req.cookies.name);
    }
    else {
        console.log("req.cookies.name" + req.cookies.name);
        fs.exists(project_root_path + "/" + global.session + "/" + req.cookies.name, function (exists) {
            if (!exists) {
                res.clearCookie('name', {path: '/'});
                res.redirect("login");//自动跳转到:my_profile_card
            }
            else if (typeof req.cookies.name == "undefined") {
                res.redirect("login");//自动跳转到:my_profile_card
            }
            else {
                callback(req, res, req.cookies.name);
            }
        });
    }
};

//登录，返回随机key
Interface.prototype.login = function (username, password, Verify, callback) {
    file.travel_dir(global.project_root_path + "/" + global.session, function (pathname) {
        //console.log(pathname);
        var db_handle = JSON.parse(file.file_read(pathname).toString('utf-8'));
        //console.log(db_handle.update_time);
        if (200000 < (time.timestamp() - db_handle.update_time)) {
            file.file_del(pathname);
        }
    });
    if ((typeof username == "undefined") && (typeof password == "undefined")) {
        callback("yes", "erro");
    }
    else {
        nosql.select(project_root_path + "/" + global.db_path + "/user.json",
            function (e) {
                return e.useid == username && e.u_password == password;
            },
            function (err, result) {

                if (typeof result[0] == "undefined") {
                    callback("yes", "erro");
                } else if (err) {
                    callback("yes", "erro");
                }
                else {
                    var login_handle_id = "" + time.getMonth() + time.getDate() + time.timestamp();

                    var login_handle = {"update_time": time.timestamp()};
                    console.log(result);
                    login_handle.id = result[0].useid;
                    file.file_write(project_root_path + "/" + global.session + "/" + login_handle_id, JSON.stringify(login_handle));
                    callback("no", login_handle_id);
                }
            }
        );
    }
};

//登出，输入key
Interface.prototype.logout = function (login_handle_id, callback) {
    var project_root_path = global.project_root_path;
    file.file_exists(project_root_path + "/" + global.session + "/" + login_handle_id, function (exists) {
        if (exists) {
            file.file_del(project_root_path + "/" + global.session + "/" + login_handle_id);
        }
        else {
            console.log("nuknow file " + project_root_path + "/" + global.session + "/" + login_handle_id);
        }
    });

    callback();
};

//根据key，返回用户id
Interface.prototype.get_user_id = function (req, res, tempid, callback) {

    var project_root_path = global.project_root_path;
    var temp = file.file_read(project_root_path + "/" + global.session + "/" + tempid);
    var login_handle = JSON.parse(temp.toString('utf-8'));

    nosql.select(project_root_path + "/" + global.db_path + "/user_info.json",
        function (e, index, self) {
            return e.useid == login_handle.id;
        },
        function (err, result, key_index) {
            if (typeof result == "undefined") {
                callback("yes", "erro", key_index);
            } else if (err) {
                callback("yes", "erro", key_index);
            }
            else {
                callback("no", result, key_index);
            }
        }
    );
};

Interface.prototype.update_user_info = function (key, json_fmt, callback) {
    var project_root_path = global.project_root_path;

    var temp = file.file_read(project_root_path + "/" + global.session + "/" + key);
    var login_handle = JSON.parse(temp.toString('utf-8'));
    json_fmt.useid = login_handle.id;
    nosql.update(project_root_path + "/" + global.db_path + "/user_info.json", 1, json_fmt, function () {
    });
    return true;
};

//读取配置文件
Interface.prototype.get_config = function (key) {
    ///////////////////////////////////////////////////////////////////////////////////////////
    global.project_name = config("name")//config_name;
    global.language = config("language") // config_language;

};

//分页
Interface.prototype.pagination = function (req, res, result, callback) {
    var out_put = new Array();
    var pn = 1;
    if ((typeof req.query.pn == "undefined") || (isNaN(req.query.pn))) {
        pn = 1;
    }
    else if (req.query.pn == 0) {
        pn = 1;
    }
    else {
        pn = parseInt(req.query.pn);
    }
    var page_max_list = 10;
    if (typeof req.query.pml == "undefined") {
        page_max_list = 10;
    }
    else {
        page_max_list = parseInt(req.query.pml);
    }

    var page_num_mod = result.length % page_max_list;
    var page_num_max = (result.length - page_num_mod) / page_max_list;
    if (page_num_mod > 0) {
        page_num_max++;
    }
    var b = page_max_list * pn - page_max_list;
    var e = page_max_list * pn;
    for (; (b < e) && (b <= result.length - 1); b++) {
        out_put.push(result[b]);
    }
    callback(out_put, pn, page_num_max);
};

module.exports = new Interface();
