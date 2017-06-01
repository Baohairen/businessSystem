/******************
@description: 后台管理首页
@author: baohairen
@update: 2017-02-04
*******************/
(function() {
  'use strict'

  angular.module('orderSystem',['ngRoute','smart-table'])
    .config(['$routeProvider', function($routeProvider){
      $routeProvider
      .when('/',{
        templateUrl:'login.html',
        controller: 'loginController'
      })
      .when('/main',{
        templateUrl:'main.html',
        controller: 'mainController'
      })
      .otherwise({redirectTo:'/'});
    }]);
  
})();
var url = '../admin.jsp'; //服务器接口地址