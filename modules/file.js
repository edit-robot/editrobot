var fs = require('fs');
var path = require("path");
var cwd = process.cwd();
var Interface = function () {
};

//文件拷贝
Interface.prototype.copy_file = function (src, dst) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dst));
};

//历遍目录
Interface.prototype.travel_dir = function (dir, callback) {
    //dir = path.join(cwd, dir);

    fs.readdirSync(dir).forEach(function (file) {
        var pathname = path.join(dir, file);
        if (fs.statSync(pathname).isDirectory()) {
            this.travel_dir(pathname, callback);
        } else {
            callback(pathname);
        }
    });
};

//创建目录
Interface.prototype.mkdirSync = function (url, mode, cb) {
    var path = require("path"), arr = url.split("/");
    mode = mode || 0755;
    cb = cb || function () {
    };
    if (arr[0] === ".") {//处理 ./aaa
        arr.shift();
    }
    if (arr[0] == "..") {//处理 ../ddd/d
        arr.splice(0, 2, arr[0] + "/" + arr[1])
    }
    function inner(cur) {
        if (!path.existsSync(cur)) {//不存在就创建一个
            fs.mkdirSync(cur, mode);
        }
        if (arr.length) {
            inner(cur + "/" + arr.shift());
        } else {
            cb();
        }
    }

    arr.length && inner(arr.shift());
};

//文件写
Interface.prototype.file_write = function (file_name, text) {
    fs.writeFileSync(file_name, text);
};

//文件读
Interface.prototype.file_read = function (file_name) {
    //file_name = path.join(cwd, file_name);
    return fs.readFileSync(file_name);
};

//判断文件是否存在
Interface.prototype.file_exists = function (file, callback) {
    fs.exists(file, function (exists) {
        callback(exists);
    });
};

//文件删除
Interface.prototype.file_del = function (file_name) {
    fs.unlink(file_name, function (err) {
        if (err) {
            throw err;
        }
    });
};
///////////////////////////////////////////////////////////////////////////////////////
module.exports = new Interface();
