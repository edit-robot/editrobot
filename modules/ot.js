var time = require('./time.js');
var Interface = function () { };
global.ot_handle_id = -1;

Interface.prototype.ot_handle_id = function handle_id() {
    if (global.ot_handle_id > 999999) {
        global.ot_handle_id = 0;
    }
    return ++global.ot_handle_id;
};

Interface.prototype.article = function (title, contents, author) {
    /*
     * 标题
     * 内容
     * 模版名称
     * 状态 state
     *      草稿 sketch
     *      发布 release
     *      回收 recycle
     * 创建时间
     * 更新时间
     * 备注
    */
    if (typeof author == "undefined") {
        var author = "empty";
    }
    if (typeof title == "undefined") {
        var title = "empty";
    }
    if (typeof contents == "undefined") {
        var contents = "empty";
    }

    return {
        "author": author,
        "title": title,
        "contents": contents,
        "otname": "article",
        "state": "sketch",
        "create_time": time.timestamp(),
        "update_time": time.timestamp(),
        "remark" : "/",
        "handle": ""+time.timestamp()+ this.ot_handle_id()
    };
};

//商品
Interface.prototype.produce = function (title, contents, price, quantity, property_json, remark) {
    /*
     * 
     * 状态 state
     *      草稿 sketch
     *      发布 release
     *      回收 recycle
     */
    if (typeof title == "undefined") {
        var title = "empty";
    }
    if (typeof contents == "undefined") {
        var contents = "empty";
    }
    if (typeof price == "undefined") {
        var price = 0.0000;
    }
    if (typeof quantity == "undefined") {
        var quantity = 0;
    }
    if (typeof property_json == "undefined") {
        var property_json = {};
    }
    if (typeof remark == "undefined") {
        var remark = "/";
    }

    return {
        "title": title,
        "contents": contents,
        "otname": "produce",
        "state": "sketch",
        "create_time": time.timestamp(),
        "update_time": time.timestamp(),
        "price" : price,
        "quantity" : quantity,
        "property_json" : property_json,
        "remark" : remark,
        "handle": "" + time.timestamp() + this.ot_handle_id()
    };
};

Interface.prototype.friends_contacts = function (name, link, remark) {
    if (typeof name == "undefined") {
        var name = "empty";
    }
    if (typeof link == "undefined") {
        var link = "empty";
    }

    return {
        "name": name,
        "link" : link,
        "remark" : remark,
        "handle": "" + time.timestamp() + this.ot_handle_id()
    };
};

module.exports = new Interface();