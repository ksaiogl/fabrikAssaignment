'use strict';
var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        .when('/', {
            controller: 'dashboard',
            templateUrl: '../templates/home.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
    // $httpProvider.interceptors.push('myHttpInterceptor');

});