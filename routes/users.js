var express_func = require('./../modules/express_func.js');
var nosql = require('./../modules/nosql.js');
var ot = require('./../modules/ot.js');
var time = require('./../modules/time.js');

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* 文件上传. */
router.all('/file-upload', function (req, res, next) {
    console.log("Request handler 'upload' was called.");
    
    var form = new formidable.IncomingForm();
    form.uploadDir = "./tmp";
    console.log("about to parse");
    form.parse(req, function (error, fields, files) {
        console.log("parsing done");
        console.log(files.upload);
        console.log(fields);
        res.send("");
    });
});


module.exports = router;
