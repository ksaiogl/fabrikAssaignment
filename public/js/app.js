'use strict';
var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        .when('/', {
            controller: 'dashboardController',
            templateUrl: '../templates/dashboard.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
});