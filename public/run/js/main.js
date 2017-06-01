/******************
@description: 后台管理主界面
@author: baohairen
@update: 2017-02-08
*******************/
(function(){
  'use strict'

  angular
    .module('orderSystem')
    .controller('mainController',mainController)

    function mainController($scope){
      //获取登录用户信息
      var loginUserData = JSON.parse(localStorage.getItem("loginUserData"));
      $('body').removeClass('first');
      if(!loginUserData){       //判断用户是否登录
        return swal({title:'<small>当前处于未登录状态，请先登录</small>',confirmButtonText:'确认'}).then(function(){
          window.location.href="index.html#/";
        });
      }
      var os = $scope;         //定义os接收$scope
      var datas;
      function activeies(api){    //页面加载请求管理员用户
        var time = Date.parse(new Date());
        var params = {
          api: api,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          datas = response.data;
          os.dataLength = datas.length;
          if(api == 'findAllAdmin'){
            os.data = datas.slice(0,10);      //定义变量data接收管理员表
          }
          if(api == 'findAllUser'){
            os.user = datas.slice(0,10);     //定义变量user接收用户表
          }
          if(api == 'findAllFood'){
            os.food = datas.slice(0,10);     //定义变量food接收产品表
          }
          if(api == 'findAllIndents'){
            os.order = datas.slice(0,10);     //定义变量order接收订单表
          }
          os.currentPage = '1';    //设置当前页面为第一页
          os.$apply();                  //后台返回的数据更改需要此方法刷新$scope中的值
        })
      }
      // 控制页面切换
      os.currentPages = function(current){
        os.currentPage = current;
        os.data = datas.slice((current-1)*10,current*10);
        os.user = datas.slice((current-1)*10,current*10);
        os.food = datas.slice((current-1)*10,current*10);
        os.order = datas.slice((current-1)*10,current*10);
        os.comment = datas.slice((current-1)*10,current*10);
      }
      os.prevPage = function(){      //上一页
        if(os.currentPage == '1'){
          return;
        }
        os.currentPages(os.currentPage-1);
      }
      os.nextPage = function(){      //下一页
        var lastPage = 1;
        if(os.dataLength>10){
          var lastPage = parseInt(os.dataLength.toString().substr(0,1))+1; 
        } 
        if(os.currentPage == lastPage){
          return;
        }
        os.currentPages(parseInt(os.currentPage)+1);
      }
      activeies('findAllAdmin');             
      os.allAdmin = true;      //所有用户页面是否展示
      os.adminName = loginUserData.adminname;    //当前管理员用户名
      os.realName = loginUserData.realName;      //当前管理员真实姓名
      os.toHome = function(){       //回到主页
        $('.manage').hide();
      }
      /*管理员用户管理 */
      os.toAdmin = function(){       //回到管理员用户管理界面
        os.updateAdmin = false;      //用户修改模块关闭
        os.addAdmin = false;        //添加用户模块关闭
        os.allAdmin = true;          //所有用户模块开启
        $('#user_manage').nextAll().remove();
        $('#user_manage').addClass('active');
        activeies('findAllAdmin');
      } 
      os.signOut = function(){      //退出登录
        return swal({title:'提示<br><small>确定要退出吗</small>',confirmButtonText:'确认',cancelButtonText: '取消',showCancelButton: true}).then(function(){
          window.location.href="index.html#/";
        });
      }
      $('.myli').click(function(){    //左侧大模块的控制
        $('.manage').hide();
        var id = $(this).attr('id');
        $('#'+id+'_page').show();
        if(id == 'user'){
          os.toAdmin();
        }
        if(id == 'custom'){
          os.toUser();
        }
        if(id == 'product'){
          os.toFood();
        }
        if(id == 'order'){
          os.toOrder();
        }
        if(id == 'comment'){
          os.toComment();
        }
      })
      os.addAdmins = function(){        //新增管理员用户界面开启
        os.allAdmin = false;
        os.addAdmin = true;
        os.form_add.$setPristine();
        os.form_add.$setUntouched();
        os.adminname_add = '';
        os.realname_add = '';
        os.password = '';
        os.passwordagain = '';
        os.gender_1 = '男';            //用户新增单选按钮性别默认选中
        os.role_1 = '超级管理员';           //用户新增单选按钮角色默认选中
        $('#user_page .breadcrumb li').removeClass('active');
        $('#user_page .breadcrumb').append('<li class="active">用户新增</li>');
      }
      os.gender_1 = '男';            //用户新增单选按钮性别默认选中
      os.role_1 = '超级管理员';           //用户新增单选按钮角色默认选中
      os.addAdminSubmit = function(){        //添加用户提交
        var time = Date.parse(new Date());
        var adminData = {
          adminname:os.adminname_add,
          realname:os.realname_add,
          password:os.password,
          gender:os.gender_1,
          identify:os.role_1,
          createTime:time
        }
        adminData = JSON.stringify(adminData);
        var params = {
          api: 'addAdmin',
          data:adminData
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          swal({title:'<small>恭喜你，添加用户成功</small>',confirmButtonText:'确认'}).then(function(){
            os.toAdmin();
            os.$apply();
          });
        })
      }
      os.updates = function(adminid){       //管理员用户修改界面开启
        os.allAdmin = false;                
        os.updateAdmin = true;
        os.adminid = adminid;
        var users = os.data;
        $('#user_page .breadcrumb li').removeClass('active');
        $('#user_page .breadcrumb').append('<li class="active">用户编辑</li>');
        for (var i = 0; i < users.length; i++) {    //遍历出当前选择用户，并为界面添加默认值
          if(users[i].adminid == adminid){
            os.realname_1 = users[i].realName;
            os.adminname_1 = users[i].adminname;
            os.gender = users[i].gender;
            os.role = users[i].identify;
            break;
          }
        };
      }
      os.updateAdminSubmit = function(){      //用户修改提交
        var time = Date.parse(new Date());
        var adminData = {
          adminname:os.adminname,
          realname:os.realname,
          gender:os.gender,
          identify:os.role,
          createTime:time
        }
        adminData = JSON.stringify(adminData);      //对象转字符串
        var params = {
          api: 'updateAdmin',
          data:adminData
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);      //字符串转json对象
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          swal({title:'<small>恭喜你，修改信息成功</small>',confirmButtonText:'确认'}).then(function(){
            os.toAdmin();
            os.$apply();
          });
        })
      }
      os.passwordReset = function(){               //密码重置
        swal({title:'提示<br><small>确定要重置密码吗？</small>',confirmButtonText:'确认',cancelButtonText: '取消',showCancelButton: true}).then(function(){
          var time = Date.parse(new Date());
          var params = {
            api: 'passwordReset',
            adminid:os.adminid
          };
          $.get(url,params,function(response){
            var response = JSON.parse(response);
            if(response.res != '1'){
              return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
            }
            swal({title:'<small>密码已重置为初始密码</small>',confirmButtonText:'确认'}).then(function(){
              os.toAdmin();
              os.$apply();
            });
          })
        });
      }
      os.delAdmin = function(){                //删除用户
        swal({title:'提示<br><small>确定要删除该用户吗？</small>',confirmButtonText:'确认',cancelButtonText: '取消',showCancelButton: true}).then(function(){
          var time = Date.parse(new Date());
          var params = {
            api: 'delAdmin',
            adminid:os.adminid
          };
          $.get(url,params,function(response){
            var response = JSON.parse(response);
            if(response.res != '1'){
              return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
            }
            swal({title:'<small>用户删除成功</small>',confirmButtonText:'确认'}).then(function(){
              os.toAdmin();
              os.$apply();
            });
          })
        });
      }
      /*客户管理 */
      os.allUser = true;     //所有客户页面展示
      os.gender_addUser = '男';    //客户新增默认性别
      os.role_addUser = '普通会员'  //客户新增默认身份
      os.toUser = function(){       //回到客户管理界面
        os.addUser = false;        //添加用户模块关闭
        os.allUser = true;          //所有用户模块开启
        $('#custom_manage').nextAll().remove();
        $('#custom_manage').addClass('active');
        activeies('findAllUser');
      } 
      os.addUsers = function(){      //新增用户打开
        os.allUser = false;
        os.addUser = true;
        os.form_addUser.$setPristine();
        os.form_addUser.$setUntouched();
        os.username = '';
        os.phone = '';
        os.gender_addUser = '男';    //客户新增默认性别
        os.role_addUser = '普通会员'  //客户新增默认身份
        $('#custom_page .breadcrumb li').removeClass('active');
        $('#custom_page .breadcrumb').append('<li class="active">客户新增</li>');
      }
      os.addUserSubmit = function(){         //客户新增提交
        var time = Date.parse(new Date());
        var userData = {
          username:os.username,
          phone:os.phone,
          address:os.address,
          gender:os.gender_addUser,
          identify:os.role_addUser
        }
        userData = JSON.stringify(userData);
        var params = {
          api: 'addUser',
          data:userData,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          swal({title:'<small>恭喜你，添加客户成功</small>',confirmButtonText:'确认'}).then(function(){
            os.toUser();
            os.$apply();
          });
        })
      }
      os.delUser = function(userid){
        swal({title:'提示<br><small>确定要删除该客户吗？</small>',confirmButtonText:'确认',cancelButtonText: '取消',showCancelButton: true}).then(function(){
          var time = Date.parse(new Date());
          var params = {
            api: 'delUser',
            userid:userid,
            time:time
          };
          $.get(url,params,function(response){
            var response = JSON.parse(response);
            if(response.res != '1'){
              return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
            }
            swal({title:'<small>用户删除成功</small>',confirmButtonText:'确认'}).then(function(){
              os.toUser();
              os.$apply();
            });
          })
        });
      }
      /* 产品管理 */
      os.allFood = true;    //所有产品列表展示
      os.state = '0';         //产品状态,0为未上架,1为已上架
      os.variety = [               //产品种类
        {name:'当季特选',id:'0'},
        {name:'披萨',id:'1'},
        {name:'好多翅',id:'2'},
        {name:'饮料',id:'3'},
        {name:'沙拉和蔬菜',id:'4'},
        {name:'超值套餐',id:'5'},
        {name:'工作日午餐',id:'6'},
        {name:'超值下午茶',id:'7'},
        {name:'饭食',id:'8'},
        {name:'意面',id:'9'},
        {name:'米线',id:'10'},
        {name:'小吃',id:'11'},
        {name:'汤',id:'12'},
        {name:'甜点',id:'13'}
      ];     
      os.toFood = function(){
        os.addFood = false;
        os.updateFood = false;
        os.allFood = true;
        os.state = '1';
        // activeies('findAllFood');
        // os.getTotalItems(1);
        os.getModelItems(0);
      }
      os.getTotalItems = function(state){      //通过产品状态查询
        os.state = state;
        var time = Date.parse(new Date());
        var params = {
          api: 'findFoodByState',
          state:state,
          foodnum:os.foodnum,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          datas = response.data;
          os.dataLength = datas.length;
          os.food = datas.slice(0,10);     //定义变量food接收产品表
          os.currentPage = '1';    //设置当前页面为第一页
          os.$apply();                  //后台返回的数据更改需要此方法刷新$scope中的值
        })
      }
      os.littleShow = function(num){    //控制小模块的显示
        $('#food_'+num).show();
      }
      $('body').click(function(){
        $('.food_little').hide();
      })
      os.getModelItems = function(foodnum1,foodnum2,foodnum3){      //通过产品种类查询
        os.foodnum = foodnum1;
        $('.food_little').hide();
        if(foodnum2){
          $('#food_'+foodnum1).show();
        }
        var time = Date.parse(new Date());
        var params = {
          api: 'findFoodByFoodNum',
          state:os.state,
          foodnum1:foodnum1,
          foodnum2:foodnum2,
          foodnum3:foodnum3,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          datas = response.data;
          os.dataLength = datas.length;
          os.food = datas.slice(0,10);     //定义变量food接收产品表
          os.currentPage = '1';    //设置当前页面为第一页
          os.$apply();                  //后台返回的数据更改需要此方法刷新$scope中的值
        })
      }
      os.addFoods = function(){                //添加商品
        os.allFood = false;
        os.addFood = true;
        os.form_addFood.$setPristine();
        os.form_addFood.$setUntouched();
        os.add = [];
        os.add.state = '1';
        os.add.foodnum = os.foodnum.toString();
        $('#logourl_add').attr('src','');
      }
      os.addFoodSubmit = function(){          //产品添加提交
        var time = Date.parse(new Date());
        var logourl = $('#logourl_add').attr('src');
        if(!logourl){
          swal({title:'<small>请上传产品图片</small>',confirmButtonText:'确认'});
        }
        logourl = logourl.substr(logourl.indexOf('images'));
        var foodData = {
          title:os.add.title,
          foodnum:os.add.foodnum,
          price:os.add.price,
          describe:os.add.describe,
          foodinfo:os.add.foodinfo,
          taste:os.add.taste,
          state:os.add.state,
          logourl:logourl,
          time:time
        }
        foodData = JSON.stringify(foodData);      //对象转字符串
        var params = {
          api: 'addFood',
          data:foodData
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);      //字符串转json对象
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          swal({title:'<small>恭喜你，添加产品成功</small>',confirmButtonText:'确认'}).then(function(){
            os.toFood();
            os.$apply();
          });
        })
      }
      os.updateFoods = function(foodid){       //商品修改页面打开
        os.allFood = false;
        os.updateFood = true;
        var time = Date.parse(new Date());
        var params = {
          api: 'findFoodById',
          foodid:foodid,
          time:time
        };
        $.get(url,params,function(response){
            var response = JSON.parse(response);
            if(response.res != '1'){
              return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
            }
            os.update = response.data[0];
            os.$apply();
          })
      }
      $('.file').change(function(){    //选择图片并上传
        var that = this;
        var id = $(this).attr('id');
        var file = document.getElementById(id);
        var formData = new FormData();
        formData.append('file',file.files[0]);
        $.ajax({
          url: '../upload',
          type: 'POST',
          data: formData,
          // async: false,
          cache: false,
          contentType: false,
          processData: false,
          success: function(data){
            $(that).next().attr("src", data.url) ;
          }
        });
      })
      os.updateFoodSubmit = function(){       //修改产品信息提交
        var time = Date.parse(new Date());
        var logourl = $('#logourl').attr('src');
        if(!logourl){
          swal({title:'<small>请上传产品图片</small>',confirmButtonText:'确认'});
        }
        logourl = logourl.substr(logourl.indexOf('images'));
        var foodData = {
          foodid:os.update.foodid,
          foodnum:os.update.foodnum,
          price:os.update.price,
          describe:os.update.describe,
          foodinfo:os.update.foodinfo,
          taste:os.update.taste,
          state:os.update.state,
          logourl:logourl,
          time:time
        }
        foodData = JSON.stringify(foodData);      //对象转字符串
        var params = {
          api: 'updateFood',
          data:foodData
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);      //字符串转json对象
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          swal({title:'<small>恭喜你，修改信息成功</small>',confirmButtonText:'确认'}).then(function(){
            os.toFood();
            os.$apply();
          });
        })
      }
      os.delFood = function(foodid,logourl){         //删除商品
        var imgsrc = logourl.substr(logourl.indexOf('images'));
        swal({title:'提示<br><small>确定要删除该产品吗？</small>',confirmButtonText:'确认',cancelButtonText: '取消',showCancelButton: true}).then(function(){
          var time = Date.parse(new Date());
          var params = {
            api: 'delFood',
            foodid:foodid,
            imgsrc:imgsrc,
            time:time
          };
          $.get(url,params,function(response){
            var response = JSON.parse(response);
            if(response.res != '1'){
              return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
            }
            swal({title:'<small>产品删除成功</small>',confirmButtonText:'确认'}).then(function(){
              os.toFood();
              os.$apply();
            });
          })
        });
      }
      /*订单管理 */
      os.toOrder = function(){       //订单首页
        os.orderInfo = false;
        os.allOrder = true;          //所有订单界面打开
        os.prosess = '0';
        // activeies('findAllIndents');
        os.getOrderProsess('0');
      }
      os.getOrderProsess = function(prosess){     //通过订单进度查询
        os.prosess = prosess;
        var time = Date.parse(new Date());
        var params = {
          api: 'findIndentByProsess',
          prosess:prosess,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          datas = response.data;
          os.dataLength = datas.length;
          os.order = datas.slice(0,10);     //定义变量order接收订单表
          os.currentPage = '1';    //设置当前页面为第一页
          os.$apply();                  //后台返回的数据更改需要此方法刷新$scope中的值
        })
      }
      os.orderInfoOpen = function(orderid){         //查看订单详情
        var time = Date.parse(new Date());
        var params = {
          api: 'findIndentidById',
          orderid:orderid,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          os.allOrder = false;
          os.orderInfo = true;
          os.orderInfos = response.data;
          os.orderlist = JSON.parse(response.data.orderlist);
          os.orderAddress = JSON.parse(response.data.address);
          if(response.data.state == '1'){
            os.orderState2 = false;
            os.orderState1 = true;
          }else{
            os.orderState1 = false;
            os.orderState2 = true;
          }
          $('.orderInfoTitle a').hide();
          $('#prosess'+os.orderInfos.prosess).css('display','inline-block');
          os.$apply();
        })
      }
      os.manageOrder = function(orderid,state,prosess){          //修改订单状态
        if(prosess == '0'){
          if(state=='1'){
            var processName = '待收货'
          }else{
            var processName = '待出餐'
          }
        }
        if(prosess == '1'){
          var processName = '已出餐'
        }
        if(prosess == '2'){
          var processName = '未评价'
        }
        if(prosess == '3'){
          var processName = '已完成'
        }
        var proses = parseInt(prosess)+1;
        proses.toString();
        var time = Date.parse(new Date());
        var params = {
          api: 'updateIndentProsess',
          prosess:proses,
          processName:processName,
          orderid:orderid,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          swal({title:'<small>修改成功</small>',confirmButtonText:'确认'}).then(function(){
            os.orderInfo = false;
            os.allOrder = true;
            os.getOrderProsess(prosess);
          })
        })
      }
      os.delOrder = function(orderid,prosess){        //删除订单
        swal({title:'提示<br><small>确定要删除该订单吗？</small>',confirmButtonText:'确认',cancelButtonText: '取消',showCancelButton: true}).then(function(){
          var time = Date.parse(new Date());
          var params = {
            api: 'delIndent',
            orderid:orderid,
            time:time
          };
          $.get(url,params,function(response){
            var response = JSON.parse(response);
            if(response.res != '1'){
              return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
            }
            swal({title:'<small>删除成功</small>',confirmButtonText:'确认'}).then(function(){
              os.orderInfo = false;
              os.allOrder = true;
              os.getOrderProsess(prosess);
            })
          })
        })
      }
      os.defaultCommentSubmit = function(orderid,userid,prosess){             //默认评价订单
        swal({title:'提示<br><small>确定要默认评价该订单吗？</small>',confirmButtonText:'确认',cancelButtonText: '取消',showCancelButton: true}).then(function(){
          var time = Date.parse(new Date());
          var param = {
            api:'findUserById',
            userid:userid,
            time:time
          }
          $.get(url,param,function(result){
            var result = JSON.parse(result);
            if(result.res != '1'){
              return swal({title:'<small>'+result.msg+'</small>',confirmButtonText:'确认'});
            }
            var commentData = {
              username:result.data.username,
              userid:userid,
              orderid:orderid,
              star:5,
              state:'0',
              content:'好评，下次还会再来的，商家服务态度也很好',
              createtime:time
            }
            commentData = JSON.stringify(commentData);
            var params = {
              api: 'addComment',
              commentData:commentData
            };
            $.get(url,params,function(response){
              var response = JSON.parse(response);
              if(response.res != '1'){
                return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
              }
              swal({title:'<small>评价成功</small>',confirmButtonText:'确认'}).then(function(){
                os.orderInfo = false;
                os.allOrder = true;
                os.getOrderProsess(prosess);
              })
            })
          }) 
        })
      }
      os.toComment = function(){                 //打开评论
        os.commentState = '0';
        os.getCommentState(os.commentState);
      }
      os.getCommentState = function(state){       //根据评论状态查询
        var time = Date.parse(new Date());
        var params = {
          api: 'findCommentByState',
          state:state,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          datas = response.data;
          os.dataLength = datas.length;
          os.comment = datas.slice(0,10);     //定义变量comment接收订单表
          os.currentPage = '1';    //设置当前页面为第一页
          os.commentState = state;
          os.$apply();                  //后台返回的数据更改需要此方法刷新$scope中的值
        })
      }
      os.updateCommentState = function(commentid,state){            //评论的发布和撤回
        var time = Date.parse(new Date());
        var params = {
          api: 'updateCommentState',
          state:state,
          commentid:commentid,
          time:time
        };
        $.get(url,params,function(response){
          var response = JSON.parse(response);
          if(response.res != '1'){
            return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
          }
          if(state == '1'){
            var content = '评论已发布';
          }else{
            var content = '评论已撤回';
          }
          swal({title:'<small>'+content+'</small>',confirmButtonText:'确认'}).then(function(){
            os.getCommentState(os.commentState);
          });
        })
      }
      os.delcomment = function(commentid){                   //删除评论
        swal({title:'提示<br><small>确定要删除该评论吗？</small>',confirmButtonText:'确认',cancelButtonText: '取消',showCancelButton: true}).then(function(){
          var time = Date.parse(new Date());
          var params = {
            api: 'delComment',
            commentid:commentid,
            time:time
          };
          $.get(url,params,function(response){
            var response = JSON.parse(response);
            if(response.res != '1'){
              return swal({title:'<small>'+response.msg+'</small>',confirmButtonText:'确认'});
            }
            swal({title:'<small>评论已删除</small>',confirmButtonText:'确认'}).then(function(){
              os.getCommentState(os.commentState);
            });
          })
        })
      }
    }
})();