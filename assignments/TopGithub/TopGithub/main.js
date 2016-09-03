//Initializing App's Main Module
var TopGithub = angular.module("TopGithub", [
                'TopGithub.home',
]);

//Initializing Home Module  
(function () {
    "use strict";

    angular.module('TopGithub.home', [
        "TopGithub.home.controllers",
        "TopGithub.home.services",
    ])

})();

//Initializing Home's Controllers
(function () {
    "use strict";
    angular.module('TopGithub.home.controllers', [])
            .controller('homeController', homeController);

    homeController.$inject = ['$rootScope','$http', '$scope', '$timeout', '$interval',  'homeService'];

    function homeController($rootScope,$http, $scope, $timeout, $interval, homeService) {

        $scope.isLoading = true;
        $scope.query = "";
        $scope.q_limit = 1;
        $scope.q_remaining = 1
        $scope.stars = 1000;
        $scope.viewType = 'list';
        $scope.searchNow =searchNow; 
        $scope.setView = setView;
        $scope.search = search;
        $scope.getLimit = getLimit;
        search();
        getLanguages();


        function search() {
            if ($scope.resultsData && $scope.resultsData.items) {
                $scope.resultsData.items = [];
                $scope.resultsData = undefined;
            }
            $scope.isLoading = true;

            var starsss = $scope.stars >= 1000 ? 10000000 : $scope.stars
            var paramString = "q=" + '+language:' + $scope.query + '+ stars:"< ' + starsss + '"&sort=stars&order=desc'
            var thePromise = homeService.search(paramString);
            thePromise.then(function (result) {
                
                $timeout(function () {
                    $scope.resultsData = result.data;
                    $scope.isLoading = false;
                    $scope.q_limit = result.data.q_limit;
                    $scope.q_remaining = result.data.q_remaining;
                }, 0);
                

            }, function (data) {
                $scope.isLoading = false;
            });


        }

        function getLanguages() {
            var thePromise = homeService.getLanguages();
            thePromise.then(function (result) {

                $timeout(function () {

                    var langs = result.data;
                    var uniques = [];
                    $.each(langs, function (i, el) {
                        if ($.inArray(el, uniques) === -1) uniques.push(el);
                    });

                    $scope.languages = uniques;
                }, 0);


            }, function (data) {
            });


        }

        function searchNow(keyEvent) {
            if (keyEvent && keyEvent.which === 13) {
                search();
            }
            else {

                $timeout(function () {
                    var find = $scope.languages.filter(function (l) {
                        return l.toLowerCase() == $scope.query.toLowerCase()
                    }).length;
                    if (find.length > 0) {
                        search();
                    }
                }, 100);


            }
        };

        function getLimit() {
            return (100-(($scope.q_remaining / $scope.q_limit)*(100))).toString() + "%";
        }

        function setView(type) {
            $scope.viewType = type;
        };

    }

})();

//Initializing Home's Service
(function () {
    angular.module('TopGithub.home.services', [])
           .factory('homeService', homeService);

    homeService.$inject = ["$timeout","$http","$q"];

    function homeService($timeout, $http, $q) {

        var homeService = {
            search: function (params) {
                var deferred = $q.defer();
                $http.get('https://api.github.com/search/repositories?'+params)
                  .success(function (data, status, headers, config) {
                     
                      data['q_remaining'] = headers()['x-ratelimit-remaining'];
                      data['q_limit'] = headers()['x-ratelimit-limit'];

                      deferred.resolve({
                          data: data
                      });
                  }).error(function (msg, code) {
                      deferred.resolve({
                          data: {}
                      });
                  });
                return deferred.promise;
            },
            getLanguages: function () {
                var deferred = $q.defer();
                $http.get('https://gist.githubusercontent.com/mayurah/5a4d45d12615d52afc4d1c126e04c796/raw/ccbba9bb09312ae66cf85b037bafc670356cf2c9/languages.json')
                  .success(function (data) {
                      deferred.resolve({
                          data: data
                      });
                  }).error(function (msg, code) {
                      deferred.reject(msg);
                  });
                return deferred.promise;
            }
        };

        return homeService;


    }
})();


//App's kick-Start Function
TopGithub.run(function () {
    console.log("App Started Successfull!")
});