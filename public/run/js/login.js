/******************
@description: 后台管理登录
@author: baohairen
@update: 2017-02-04
*******************/
(function() {
  'use strict'
  angular
    .module('orderSystem')
    .controller('loginController', loginController)

    function loginController($scope){
      $('body').addClass('first');
      var os = $scope;     //定义os接收$scope
      os.remember = true; //记住登录状态
      var isremember = localStorage.getItem("remember");
      if(isremember == 'true'){      //判断是否记住登录状态
        $scope.username = JSON.parse(localStorage.getItem("loginUserData")).adminname;
      }
      /** 登录按钮click; */
      os.login = function() {
        localStorage.setItem('remember',os.remember);
        var time = Date.parse(new Date());    //定义时间戳
        var params = {   
          api: 'findAdmin',
          adminname: os.username,
          password: os.password,
          time:time
        };
        $.get(url,params,function(reponse){
          var reponse = JSON.parse(reponse);
          localStorage.setItem("loginUserData", JSON.stringify(reponse.data));
          if(reponse.res != '1'){
            return swal({title:'<small>'+reponse.msg+'</small>',confirmButtonText:'确认'});
          }
          window.location.href="index.html#/main";
        })
      }
    }
})();