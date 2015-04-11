var fs = require("fs");
var path = require("path");
module.exports = function () {
    var cwd = process.cwd();
    var cfgpath = path.resolve(cwd, "config.json");
    var file = fs.readFileSync(cfgpath);
    var config = JSON.parse(file);
    return function (key) {
        return config[key];
    }
}
