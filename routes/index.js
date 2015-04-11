var file = require('./../modules/file.js');
var net = require('./../modules/net.js');
var url = require("url");
var express_func = require('./../modules/express_func.js');
var nosql = require('./../modules/nosql.js');
var ot = require('./../modules/ot.js');
var time = require('./../modules/time.js');

var express = require('express');
var formidable = require("formidable");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.all('/install', function(req, res, next){
    
    //登录资料
	var json_fmt = [
        {},
		{useid:'admin', u_password:'admin', Remark:"admin"}
    ];
	file.file_write(global.project_root_path+"/"+ global.db_path+"/user.json",JSON.stringify(json_fmt));
    
    //个人通讯资料
	var json_fmt = [
        {},
		{useid:'xxx', nickname:'xxx',qq:'xxx', address:'xxx',mobile:'xxx', email:'xxx@xxx.xxx'}
    ];
	file.file_write(global.project_root_path+"/"+ global.db_path+"/user_info.json",JSON.stringify(json_fmt));
    
    //友情连接
    var json_fmt = [
        {},
        ot.friends_contacts('myself', 'http://localhost/users'),
        ot.friends_contacts('myself', 'http://localhost/users'),
        ot.friends_contacts('myself', 'http://localhost/users'),
        ot.friends_contacts('myself', 'http://localhost/users'),
        ot.friends_contacts('myself', 'http://localhost/users'),
        ot.friends_contacts('myself', 'http://localhost/users'),
        ot.friends_contacts('myself', 'http://localhost/users'),
        ot.friends_contacts('myself', 'http://localhost/users')
    ];
    file.file_write(global.project_root_path + "/"+ global.db_path+"/friends_contacts.json", JSON.stringify(json_fmt));
    
    //数据资料
    var json_fmt = [
        {},
        ot.article("title", "con"),
        ot.article("title", "con"),
        ot.article("title", "con"),
        ot.article("title", "con"),
        ot.article("title", "con"),
        ot.article("title", "con")
    ];
    file.file_write(global.project_root_path + "/" + global.db_path + "/media.json", JSON.stringify(json_fmt));
    
    //标签列表
	var json_fmt = [
        {},
		{tag:'qwqeqw'},
		{tag:'qwqeqw'}
    ];
	file.file_write(global.project_root_path+"/"+ global.db_path+"/tag.json",JSON.stringify(json_fmt));
    
    //标签绑定的数据
	var json_fmt = [
        {},
		{tag_id:'qwqeqw',Contents_id:'qwqeqw'},
		{tag_id:'qwqeqw',Contents_id:'qwqeqw'}
    ];
	file.file_write(global.project_root_path+"/"+ global.db_path+"/tag_link.json",JSON.stringify(json_fmt));

	res.render(
		'test',
		{
			title: __dirname
		}
	);
});

//首页展示
router.all('/index', function(req, res, next){
	
    // console.log(req.cookies.name);
    //res.redirect("contacts_us.html");
	res.render(
		'index',
		{
			title: "/index"
		}
	);
});

//多媒体列表
router.all('/media_list', function (req, res, next) {
    nosql.select(global.project_root_path + "/"+ global.db_path+"/media.json",
		function (e, index, self) {
            return e.otname == "article" && e.state == "release";
        },
		function (err, result, key_index) {
            if (typeof result == "undefined") {
                res.redirect("err.html?title=404&err_msg=404");
            } else if (err) {
                res.redirect("err.html?title=err&err_msg=err");
            }
            else {
                express_func.pagination(req, res, result, function (out_put, pn, page_num_max) {
                    res.render(
                        'media_list',
                        {
                            title: "media_list",
                            contents_list: out_put,
                            pn_now: pn,
                            page_num_max : page_num_max
                        }
                    );
                });
            }
        }
    );
});

//多媒体页面
router.all('/media', function (req, res, next){
    if (typeof req.query.mediahandle == "undefined") {
        res.redirect("err.html?title=404&err_msg=404错误！没此页面.");
    }
    else {
        nosql.select(global.project_root_path + "/"+ global.db_path+"/media.json",
		    function (e, index, self) {
                return e.otname == "article" && e.handle == req.query.mediahandle;
            },
		    function (err, result, key_index) {
                if (typeof result == "undefined") {
                    res.redirect("err.html?title=404&err_msg=404");
                } else if (err) {
                    res.redirect("err.html?title=err&err_msg=err");
                }
                else {
                    res.render(
                        'media',
                        {
                            title: "media",
                            page_title: result[0].title,
                            contents: result[0].contents,
                            handle: result[0].handle
                        }
                    );
                }
            }
        );
    }
});

//Two-dimensional code我的二维码
router.all('/tdc', function(req, res){
	res.render(
		'tdc',
		{
			title: "tdc"
		}
	);
});

router.all('/contacts_us', function (req, res, next) {
    var temp = nosql.read(global.project_root_path + "/"+ global.db_path+"/user_info.json");
    if (typeof temp != "undefined") {
        console.log(temp);
        res.render(
            'contacts_us',
		    {
                title: "contacts_us",
                contacts_us : temp[1]
            }
        );
    }
});

router.all('/login', function(req, res, next){
	req.setEncoding('utf8');// 设置接收数据编码格式为 UTF-8
    res.clearCookie('name', { path: '/' });
	//console.log(url.parse(req.url).pathname);
	
	express_func.login(req.body.account,req.body.password,"",function(err,login_handle_id){
		if(err == "no"){
			res.cookie(
				'name', ""+login_handle_id ,
				{
					expires: new Date(Date.now() + 9000000),
					maxAge: 9000000
				}
			);
			res.redirect("my_profile_card");//自动跳转到:my_profile_card.html
		}
		else{
			res.render(
				'login',
				{
					title: "登录",
					msg: ""
				}
			);
		}
	});
});

router.all('/logout', function(req, res, next){
	express_func.logout(req.cookies.name,function(){
		res.clearCookie('name', { path: '/' });
		res.render(
			'logout',
			{
				title: "logout"
			}
		);
	});
});

router.all('/host', function (req, res, next) {
    express_func.login_handle_manage(req, res, function (req, res, tempid) {
        //console.log(express_func.host_info());
        res.render(
            'host',
		    {
                title: "host",
                os : express_func.host_info()
            }
        );
    });
});

//个人名片资料设置
router.all('/my_profile_card', function(req, res, next){
    express_func.login_handle_manage(req, res, function (req, res, tempid){
        
        express_func.get_user_id(req, res, tempid, function (err, result, key_index){
			console.log(result);
			if(err == "no"){
				res.render(
					'my_profile_card',
					{
						title: "my_profile_card",
						nickname:result[0].nickname,
						qq: result[0].qq,
						address: result[0].address,
						mobile: result[0].mobile,
						email: result[0].email
					}
				);
			}
		});
	});
});

//友情链接
router.all('/friends_contacts', function(req, res, next){
    express_func.login_handle_manage(req, res, function (req, res, tempid) {
        var temp = nosql.read(global.project_root_path + "/"+ global.db_path+"/friends_contacts.json");
        temp.splice(0, 1);
        express_func.pagination(req, res, temp,
            function (out_put, pn, page_num_max){
                // console.log(out_put, pn, page_num_max);
                res.render(
                    'friends_contacts',
                    {
                        title: "friends_contacts",
                        contents_list: out_put,
                        pn_now: pn,
                        page_num_max : page_num_max
                    }
            );
        });
	});
});

//内容管理页面
router.all('/contents', function(req, res, next){
	console.log('contents');
    express_func.login_handle_manage(req, res, function (req, res, tempid){
        
        nosql.select(global.project_root_path + "/"+ global.db_path+"/media.json",
		    function (e, index, self) {
                return e.otname == "article";
            },
		    function (err, result, key_index) {
                if (typeof result == "undefined") {
                    res.redirect("err.html?title=404&err_msg=404");
                } else if (err) {
                    res.redirect("err.html?title=err&err_msg=err");
                }
                else {
                    express_func.pagination(req, res, result, function (out_put, pn, page_num_max) {
                        if ( typeof out_put[0] == "undefined") {
                            res.render(
                                'contents',
                                    {
                                    title: "contents",
                                    contents_list: out_put,
                                    pn_now: pn,
                                    page_num_max : 0
                                }
                            );
                        }
                        else {
                            res.render(
                                'contents',
                                {
                                    title: "contents",
                                    contents_list: out_put,
                                    pn_now: pn,
                                    page_num_max : page_num_max
                                }
                            );
                        }
                    });
                }
            }
        );
	});
});

//创建内容
router.all('/create_content', function(req, res, next){
    express_func.login_handle_manage(req, res, function (req, res, tempid){

        nosql.push(global.project_root_path + "/"+ global.db_path+"/media.json",
            ot.article(),
		    function (new_content_handle) {
                res.redirect("edit_content?edit=" + new_content_handle.handle);
            }
        );
	});
});

router.all('/edit_content', function(req, res, next){//编辑内容
    express_func.login_handle_manage(req, res, function (req, res, tempid){
        if (typeof req.query.edit == "undefined") {
            res.redirect("err.html?title=404&err_msg=404错误！没此文章.");
        }
        else {
            nosql.select(global.project_root_path + "/"+ global.db_path+"/media.json",
		        function (e, index, self) {
                    return e.otname == "article" && e.handle == req.query.edit;
                },
		        function (err, result, key_index) {
                    if (typeof result == "undefined") {
                        res.redirect("err.html?title=404&err_msg=404");
                    } else if (err) {
                        res.redirect("err.html?title=err&err_msg=err");
                    }
                    else {
                        //console.log(result)
                        res.render(
                            'edit_content',
                            {
                                title: "edit_content",
                                page_title: result[0].title,
                                contents: result[0].contents,
                                state: result[0].state,
                                handle: result[0].handle
                            }
                        );
                    }
                }
            );
        }
	});
});

router.all('/err', function (req, res, next)
{
    //报错页面
    //console.log("get:" + req.query.title);
    //console.log("get:" + req.query.err_msg);
    
    //console.log("post:" + req.body.title);
    //console.log("post:" + req.body.err_msg);
    
    var new_db = {};
    if (typeof req.body.title != "undefined") {
        new_db.title = req.body.title;
    }
    else if (typeof req.query.title != "undefined") {
        new_db.title = req.query.title;
    }
    else { new_db.title = "NULL"; }
    
    if (typeof req.body.err_msg != "undefined") {
        new_db.err_msg = req.body.err_msg
    }
    else if (typeof req.query.err_msg != "undefined") {
        new_db.err_msg = req.query.err_msg;
    }
    else { new_db.err_msg = "NULL"; }
    
    res.render(
        'err',
			{
            title: new_db.title,
            err_msg: new_db.err_msg
        }
    );
});


router.all('/update_users_info', function (req, res, next) {
    //console.log(req.body.nickname);
    //console.log(req.body.qq);
    //console.log(req.body.address);
    //console.log(req.body.mobile);
    //console.log(req.body.email);

    express_func.login_handle_manage(req, res, function () {
        var new_db = {};
        if (typeof req.body.nickname != "undefined") {
            new_db.nickname = req.body.nickname
        }
        else { new_db.nickname = ""; }
        
        if (typeof req.body.qq != "undefined") {
            new_db.qq = req.body.qq
        }
        else { new_db.qq = ""; }
        
        if (typeof req.body.address != "undefined") {
            new_db.address = req.body.address
        }
        else { new_db.address = ""; }
        
        if (typeof req.body.mobile != "undefined") {
            new_db.mobile = req.body.mobile
        }
        else { new_db.mobile = ""; }
        
        if (typeof req.body.email != "undefined") {
            new_db.email = req.body.email
        }
        else { new_db.email = ""; }
        
        if (typeof req.cookies.name != "undefined") {
            express_func.update_user_info(req.cookies.name, new_db,
                res.redirect("my_profile_card")//自动跳转到:my_profile_card.html
            );
        }
    });
});

router.all('/save_content', function (req, res, next) {//保存文章内容
    console.log("do save");
    console.log(req.body.title);
    console.log(req.body.contents);
    console.log(req.body.state);
    console.log(req.query.edit);

    express_func.login_handle_manage(req, res, function () {
        var new_db = {};
        if (typeof req.body.title != "undefined") {
            new_db.title = req.body.title;
        }
        else {
            new_db.title = "";
        }

        if (typeof req.body.contents != "undefined") {
            new_db.contents = req.body.contents
        }
        else {
            new_db.contents = "";
        }

        if (typeof req.body.state != "undefined") {
            new_db.state = req.body.state
        }
        else {
            new_db.contents = "sketch";
        }

        var the_nosql_db = nosql.read(project_root_path + "/db/media.json");
        the_nosql_db.filter(function (e, index, self) {
            if (self[index].handle+"" == req.query.edit) {
                self[index].title = new_db.title;
                self[index].contents = new_db.contents;
                self[index].state = new_db.state;
                self[index].update_time = time.timestamp();
                nosql.write(global.project_root_path + "/db/media.json", self);
            }
            return e.otname == "article" && e.handle == req.query.edit;
        });
        
        res.redirect("edit_content?edit="+ req.query.edit)//自动跳转到:edit_content

    });
});

router.all('/del_content', function (req, res, next) {
    express_func.login_handle_manage(req, res, function () {
        //console.log(req.query.del);
        var new_db = {};
        if (typeof req.query.del != "undefined") {
            new_db.contents = req.query.del;
        }
        
        nosql.del(global.project_root_path + "/db/media.json", req.query.del,
            function (e, index, self, handle) {
                return e.otname == "article" && e.handle == handle;
            }
        );
        res.redirect("contents");//自动跳转到:edit_content
    });
});

router.all('/create_friends_contacts', function (req, res, next) {
    console.log("post name:"+req.body.name);
    console.log("post link:" +req.body.link);
    console.log("post remark:" + req.body.remark);

    express_func.login_handle_manage(req, res, function (req, res, tempid) {
        var new_db = {};
        if (typeof req.body.name != "undefined") {
            new_db.name = req.body.name;
        }
        else { new_db.name = ""; }

        if (typeof req.body.link != "undefined") {
            new_db.link = req.body.link;
        }
        else { new_db.link = ""; }
        
        if (typeof req.body.remark != "undefined") {
            new_db.remark = req.body.remark;
        }
        else { new_db.remark = ""; }

        
        nosql.push(global.project_root_path + "/db/friends_contacts.json",
            ot.friends_contacts(new_db.name, new_db.link, new_db.remark),
		    function (new_content_handle) {
                res.redirect("friends_contacts");
            }
        );
    });
});

router.all('/del_friends_contacts', function (req, res, next) {
    express_func.login_handle_manage(req, res, function () {
        //console.log(req.query.del);
        var new_db = {};
        if (typeof req.query.del != "undefined") {
            new_db.contents = req.query.del;
        }
        
        nosql.del(global.project_root_path + "/db/friends_contacts.json", req.query.del,
            function (e, index, self, handle) {
                return e.handle == handle;
            }
        );
        res.redirect("friends_contacts.html");//自动跳转到:edit_content.html
    });
});
module.exports = router;