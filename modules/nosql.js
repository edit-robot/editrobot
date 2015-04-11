
var express = require('express');
var file = require('./file.js');

var Interface = function(){};

Interface.prototype.read = function (db_path) {
    var temp = file.file_read(db_path);
    return JSON.parse(temp.toString('utf-8'));
};

Interface.prototype.write = function (db_path, db_handle) {
    file.file_write(db_path, JSON.stringify(db_handle));
};

Interface.prototype.select = function(db_path,callback1,callback2){
	var temp = file.file_read(db_path);
	var db_handle = JSON.parse(temp.toString('utf-8'));
    var key_index = -1
    var db_handle_result = db_handle.filter(function (e, index, self){
        key_index = index;
        return callback1(e, index, self);
    });
	if(typeof db_handle[0] == "undefined"){
		callback2(1, db_handle_result, key_index);
	}
	else{
		callback2(0, db_handle_result, key_index);
    }
    return key_index;
};

Interface.prototype.push = function (db_path, json_fmt, callback) {
    var temp = file.file_read(db_path);
    var db_handle = JSON.parse(temp.toString('utf-8'));
    db_handle.push(json_fmt);
    file.file_write(db_path, JSON.stringify(db_handle));
    callback(db_handle[db_handle.length-1]);
};

Interface.prototype.update = function (db_path, id, json_fmt, callback) {
    var temp = file.file_read(db_path);
    var db_handle = JSON.parse(temp.toString('utf-8'));
    db_handle[id] = json_fmt;
    console.log(db_handle);
    file.file_write(db_path, JSON.stringify(db_handle));
    callback();
};

Interface.prototype.del = function (db_path, handle, callback) {
    this.read(db_path).filter(function (e, index, self) {
        if (self[index].handle + "" == handle) {
            self.splice(index, 1);
            file.file_write(db_path, JSON.stringify(self));
        }
        return callback(e, index, self,handle);
    });
};

module.exports = new Interface();