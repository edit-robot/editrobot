var mysql = require('mysql');

var connection = mysql.createConnection({
	host : "localhost",
	port : 3306,
	database : "kaka",
	user : "root",
	password : ""
});

connection.connect();

module.exports = connection;

/*
var mysql = require('./../modules/db.js');

var mysql_console = mysql.query('select * from users', function(err, result){
		if(!err){
			console.log(result[0].useid);
			
		}
		else{
			console.log(err);
		}
	});
*/