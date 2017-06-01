var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var request = require("request");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
var mysql= require('mysql');
var crypto = require('crypto');
var qiniu = require("qiniu");
var fs = require('fs');
var https = require('https');

var privateKey  = fs.readFileSync('./private.pem', 'utf8'),
certificate = fs.readFileSync('./file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpsServer = https.createServer(credentials, app);
var SSLPORT = 8002;
httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

var connection = mysql.createConnection({
  host     : '60.205.210.86',
  user     : 'root',
  password : 'fallen',
  database : 'orders'
});

connection.connect();  //链接数据库

// connection.end(); 关闭数据库链接



qiniu.conf.ACCESS_KEY = 'EBIiSM01O8WeA-FxaH8-JLOlPyX0IFAHhW6PYPzO';
qiniu.conf.SECRET_KEY = '9bapKkezJYWixACRAfw9BkYRyAV9VYX896vwBw4n';
//构建bucketmanager对象
var client = new qiniu.rs.Client();
//你要测试的空间， 并且这个key在你空间中存在
bucket = 'graduation';

//构建上传策略函数
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  return putPolicy.token();
}


function successData(data){     //成功回调函数
  var results={
    "res":"1",
    "msg":"成功",
    "data":data
  }
  results = JSON.stringify(results);    
  return results;
}
function failData(data){       //失败回调函数
  var results={
    res:"0",
    msg:data
  }
  results = JSON.stringify(results);
  return results;
}
 
app.get('/admin.jsp', function (req, res) {    //调取接口url
  var api = req.query.api;
  if(!api){
    res.send(failData('api为空，调用接口出错！'));
    return;
  }
  if(api == 'findAdmin'){              //登录接口
    var adminname = req.query.adminname;
    var password = req.query.password;
    connection.query('select * FROM admin where adminname="'+adminname+'"', function(err, rows, fields) {
      if(err){
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      if(rows.length!=1){
        res.send(failData('用户名错误,请再次输入！'));
        return;
      }
      if(rows[0].password != password){
        res.send(failData('密码错误,请再次输入！'));
        return;
      }
      res.send(successData(rows[0]));
    }); 
  }
  if(api == 'findAllAdmin'){          //查找所有管理员接口
    connection.query('select * FROM admin', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'updateAdmin'){          //更改管理员信息接口
    var adminData = req.query.data;
    adminData = JSON.parse(adminData);
    var adminname = adminData.adminname;
    connection.query('update admin set ? where adminname="'+adminname+'"',adminData,function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'passwordReset'){       //密码重置接口
    var adminid = req.query.adminid;
    connection.query('update admin set password="111111" where adminid="'+adminid+'"',function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'addAdmin'){           //添加管理员用户接口
    var adminData = req.query.data;
    adminData = JSON.parse(adminData);
    connection.query('insert INTO admin set ?',adminData,function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'delAdmin'){         //删除管理员接口
    var adminid = req.query.adminid;
    connection.query('delete from admin where adminid="'+adminid+'"',function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  /* 客户管理api */
  if(api == 'findAllUser'){      //查询所有客户接口
    connection.query('select * FROM user', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'addUser'){           //添加客户接口
    var userData = req.query.data;
    userData = JSON.parse(userData);
    connection.query('insert INTO user set ?',userData,function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'delUser'){         //删除客户接口
    var userid = req.query.userid;
    connection.query('delete from user where userid="'+userid+'"',function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  /* 产品管理api */
  if(api == 'findAllFood'){     //查找所有产品
    connection.query('select * FROM food', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'findFoodByState'){     //通过状态查找产品
    var state = req.query.state;
    var foodnum = req.query.foodnum;
    connection.query('select * FROM food where state="'+state+'" and foodnum="'+foodnum+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'findFoodByFoodNum'){      //通过产品类型查找产品
    var state = req.query.state;
    var foodnum1 = req.query.foodnum1;
    var foodnum2 = req.query.foodnum2;
    var foodnum3 = req.query.foodnum3;
    // connection.query('select * FROM food where state="'+state+'" and foodnum in('+foodnum1,foodnum2,foodnum3+')',function(err, rows, fields) {
    connection.query('select * FROM food where state="'+state+'" and (foodnum="'+foodnum1+'" or foodnum="'+foodnum2+'" or foodnum="'+foodnum3+'")', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'findFoodById'){    //通过产品id查找产品详情
    var foodid = req.query.foodid;
    connection.query('select * FROM food where foodid="'+foodid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'updateFood'){      //修改产品信息
    var fooddata = req.query.data;
    fooddata = JSON.parse(fooddata);
    var foodid = fooddata.foodid;
    key = fooddata.logourl;
    //生成上传 Token
    token = uptoken(bucket, key);
    //要上传文件的本地路径
    filePath = './public/'+fooddata.logourl;
    //调用uploadFile上传
    var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(token, key, filePath, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        console.log(ret.hash, ret.key, ret.persistentId); 
        fooddata.logourl = 'http://ol58x6i5t.bkt.clouddn.com/'+key;
        connection.query('update food set ? where foodid="'+foodid+'"',fooddata,function(err, result) {
          if(err){
            console.log(err);
            res.send(failData('服务器异常，请重新访问'));
            return;
          }
          res.send(successData());
        });
      } else {
        // 上传失败， 处理返回代码
        console.log(err);
      }
    });
  }
  if(api == 'addFood'){            //添加商品
    var fooddata = req.query.data;
    fooddata = JSON.parse(fooddata);
    key = fooddata.logourl;
    //生成上传 Token
    token = uptoken(bucket, key);
    //要上传文件的本地路径
    filePath = './public/'+fooddata.logourl;
    //调用uploadFile上传
    var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(token, key, filePath, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        console.log(ret.hash, ret.key, ret.persistentId); 
        fooddata.logourl = 'http://ol58x6i5t.bkt.clouddn.com/'+key;
        connection.query('insert INTO food set ?',fooddata,function(err, result) {
          if(err){
            console.log(err);
            res.send(failData('服务器异常，请重新访问'));
            return;
          }
          res.send(successData());
        });
      } else {
        // 上传失败， 处理返回代码
        console.log(err);
      }
    });
  }
  if(api == 'delFood'){          //删除产品
    key = req.query.imgsrc;
    //删除资源
    client.remove(bucket, key, function(err, ret) {
      if (!err) {
        var foodid = req.query.foodid;
        connection.query('delete from food where foodid="'+foodid+'"',function(err, result) {
          if(err){
            console.log(err);
            res.send(failData('服务器异常，请重新访问'));
            return;
          }
          res.send(successData());
        });
      } else {
        console.log(err);
      }
    });
  }
  /* 订单管理 */
  if(api == 'findAllIndents'){          //查找所有订单
    connection.query('select * FROM indent order by orderid desc', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'findIndentByProsess'){       //通过订单进度查询订单
    connection.query('select * FROM indent where prosess="'+req.query.prosess+'" order by orderid desc', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'updateIndentProsess'){            //修改订单进度
    var orderid = req.query.orderid;
    var orderData = {
      prosess:req.query.prosess,
      processName:req.query.processName
    }
    connection.query('update indent set ? where orderid="'+orderid+'"',orderData,function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'delIndent'){                //删除订单
    var orderid = req.query.orderid;
    connection.query('delete from indent where orderid="'+orderid+'"',function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'findIndentidById'){             //查询订单详情
    var orderid = req.query.orderid;
    connection.query('select * FROM indent where orderid="'+orderid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows[0]));
    });
  }
  if(api == 'findCommentByState'){          //通过评论状态查询评论
    connection.query('select * FROM comment where state="'+req.query.state+'" order by commentid desc', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'updateCommentState'){            //评论的发布于撤回
    connection.query('update comment set state ="'+req.query.state+'" where commentid="'+req.query.commentid+'"',function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'delComment'){
    connection.query('delete from comment where commentid="'+req.query.commentid+'"',function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }

  /***********************客户端接口*******************************/

  if(api == 'getOpenid'){        //获取用户openid
    var code = req.query.code;
    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=wx7f56f00cc2119078&secret=8d0a1429b1ec57834a10d2562c8f6950&js_code='+code+'&grant_type=authorization_code';
    request(url, function(error, response, body) {
      body = JSON.parse(body);
      res.send(successData(body.openid));
    })
  }
  if(api == 'searchUser'){      //查找用户是否存在，如果存在则返回数据，否则注册新用户
    var userData = req.query.data;
    userData = JSON.parse(userData);
    connection.query('select * FROM user where openid="'+userData.openid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      if(rows.length > 0){
        res.send(successData(rows[0]));
        return;
      }
      connection.query('insert INTO user set ?',userData,function(err, result) {
        if(err){
          console.log(err);
          res.send(failData('服务器异常，请重新访问'));
          return;
        }
        userData.userid = result.insertId;
        res.send(successData(userData));
      });
    });
  }
  if(api == 'findUserById'){         //通过客户id查找客户详情
    var userid = req.query.userid;
    connection.query('select * FROM user where userid="'+userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows[0]));
    });
  }
  if(api == 'modifyUser'){          //修改客户信息
    var userData = req.query.userData;
    userData = JSON.parse(userData);
    connection.query('update user set ? where userid="'+userData.userid+'"',userData,function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'findAddress'){      //查找用户所有地址
    connection.query('select directory FROM user where userid="'+req.query.userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows[0].directory));
    })
  }
  if(api == 'addAddress'){        //添加收货地址
    var address = req.query.address;
    address = JSON.parse(address);
    connection.query('select directory FROM user where userid="'+req.query.userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      var directory = rows[0].directory;
      if(!directory){
        directory = [];
        address.addresId = req.query.userid+'_001';
      }else{
        directory = JSON.parse(directory);
        var item = directory[directory.length-1].addresId;
        item = item.substr(item.length-1);
        item = parseInt(item)+1;
        address.addresId = req.query.userid+'_00'+item;
      }
      directory.push(address);
      directory = JSON.stringify(directory);
      connection.query("update user set directory='"+directory+"' where userid='"+req.query.userid+"'",function(err, result) {
        if(err){
          console.log(err);
          res.send(failData('服务器异常，请重新访问'));
          return;
        }
        directory = JSON.parse(directory);
        res.send(successData(directory));
      });
    });
  }
  if(api == 'findAddressById'){       //通过地址id查找单个地址信息
    connection.query('select directory FROM user where userid="'+req.query.userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      var directory = rows[0].directory;
      directory = JSON.parse(directory);
      for (var i = 0; i < directory.length; i++) {
        if(directory[i].addresId == req.query.addresId){
          res.send(successData(directory[i]));
          break;
        }
      };
    })
  }
  if(api == 'delAddress'){           //删除指定地址
    connection.query('select directory FROM user where userid="'+req.query.userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      var directory = rows[0].directory;
      directory = JSON.parse(directory);
      for (var i = 0; i < directory.length; i++) {
        if(directory[i].addresId == req.query.addresId){
          directory.splice(i,1);
          break;
        }
      };
      if(directory.length<1){
        directory = '';
      }else{
        directory = JSON.stringify(directory);
      }
      connection.query("update user set directory='"+directory+"' where userid='"+req.query.userid+"'",function(err, result) {
        if(err){
          console.log(err);
          res.send(failData('服务器异常，请重新访问'));
          return;
        }
        if(directory){
          directory = JSON.parse(directory);
        }
        res.send(successData(directory));
      });
    })
  }
  if(api == 'updateAddress'){         //修改指定地址
    var address = req.query.address;
    address = JSON.parse(address);
    connection.query('select directory FROM user where userid="'+req.query.userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      var directory = rows[0].directory;
      directory = JSON.parse(directory);
      for (var i = 0; i < directory.length; i++) {
        if(directory[i].addresId == address.addresId){
          directory[i] = address;
          break;
        }
      };
      directory = JSON.stringify(directory);
      connection.query("update user set directory='"+directory+"' where userid='"+req.query.userid+"'",function(err, result) {
        if(err){
          console.log(err);
          res.send(failData('服务器异常，请重新访问'));
          return;
        }
        directory = JSON.parse(directory);
        res.send(successData(directory));
      });
    })
  }
  if(api == 'findOneAddress'){          //查找地址
    connection.query('select directory FROM user where openid="'+req.query.openid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      var directory = rows[0].directory;
      if(!directory){
        res.send(successData());
      }else{
        directory = JSON.parse(directory);
        res.send(successData(directory[0]));
      }
    })
  }
  if(api == 'addOrder'){               //添加订单
    var orderData = req.query.orderData;
    orderData = JSON.parse(orderData);
    connection.query('insert INTO indent set ?',orderData,function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'findAllOrder'){          //查找用户所有订单
    var userid = req.query.userid;
    connection.query('select * FROM indent where userid="'+userid+'" order by orderid desc', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'findOrderByState'){          //通过订单类型查找订单
    var userid = req.query.userid;
    var state = req.query.state;
    connection.query('select * FROM indent where userid="'+userid+'" and state="'+state+'" order by orderid desc', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'findOrderByProsess'){             //通过订单进度查找订单
    var userid = req.query.userid;
    var prosess = req.query.prosess;
    connection.query('select * FROM indent where userid="'+userid+'" and prosess="'+prosess+'" order by orderid desc', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows));
    });
  }
  if(api == 'remindReciveOrder'){               //顾客提醒商家接单或者催单
    var orderid = req.query.orderid;
    var remark = req.query.remark;
    connection.query('update indent set remark="'+remark+'" where orderid="'+orderid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'cancelOrder'){                    //取消订单
    var orderid = req.query.orderid;
    var orderData = {
      prosess:'5',
      processName:'已取消'
    }
    connection.query('update indent set ? where orderid="'+orderid+'"',orderData,function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
  if(api == 'addComment'){          //添加评论
    var commentData = req.query.commentData;
    commentData = JSON.parse(commentData);
    connection.query('insert INTO comment set ?',commentData,function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      var orderid = commentData.orderid;
      var orderData = {
        prosess:'4',
        processName:'已完成'
      }
      connection.query('update indent set ? where orderid="'+orderid+'"',orderData,function(err, result) {
        if(err){
          console.log(err);
          res.send(failData('服务器异常，请重新访问'));
          return;
        }
        res.send(successData());
      });
    });
  }
  if(api == 'addCollect'){        //收藏
    var collect1 = req.query.collect;
    collect1 = JSON.parse(collect1);
    connection.query('select collect FROM user where userid="'+req.query.userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      var collect = rows[0].collect;
      if(!collect){
        collect = [];
      }else{
        collect = JSON.parse(collect);
      }
      collect.push(collect1);
      collect = JSON.stringify(collect);
      connection.query("update user set collect='"+collect+"' where userid='"+req.query.userid+"'",function(err, result) {
        if(err){
          console.log(err);
          res.send(failData('服务器异常，请重新访问'));
          return;
        }
        res.send(successData(collect));
      });
    });
  }
  if(api == 'cancelCollect'){         //取消收藏
    var collect1 = req.query.collect;
    collect1 = JSON.parse(collect1);
    connection.query('select collect FROM user where userid="'+req.query.userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      var collect = rows[0].collect;
      collect = JSON.parse(collect);
      for (var i = 0; i < collect.length; i++) {
        if(collect[i].foodid == collect1.foodid){
          collect.splice(i,1);
        }
      };
      collect = JSON.stringify(collect);
      connection.query("update user set collect='"+collect+"' where userid='"+req.query.userid+"'",function(err, result) {
        if(err){
          console.log(err);
          res.send(failData('服务器异常，请重新访问'));
          return;
        }
        res.send(successData(collect));
      });
    });
  }
  if(api == 'findCollect'){        //查找用户所收藏的商品
    connection.query('select collect FROM user where userid="'+req.query.userid+'"', function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData(rows[0].collect));
    })
  }
  if(api == 'openVIP'){       //开通会员
    connection.query("update user set identify='超级会员' where userid='"+req.query.userid+"'",function(err, result) {
      if(err){
        console.log(err);
        res.send(failData('服务器异常，请重新访问'));
        return;
      }
      res.send(successData());
    });
  }
});

// 图片上传接口
var storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, './public/images')
  },
  filename: function (req, file, cb){
    cb(null, file.originalname)
  }
});
var upload = multer({
  storage: storage
});
app.post('/upload', upload.single('file'), function (req, res, next) {
  var url = 'http://' + req.headers.host + '/images/' + req.file.originalname
  res.json({
    url : url
  })
});

var server = app.listen(8001, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("应用实例，访问地址为 http://%s:%s", host, port);
});