
var app = angular.module('myApp');
app
    .controller('dashboard', function ($scope, $routeParams, $http, $location) {
        $scope.RenderChanges = [];
        console.log("==========================");
        $http.get('/loadBalance/getRenderChanges').then(function mySuccess(response) {
            console.log("dashboard accessed successfully,res: " + JSON.stringify(response));
            $scope.RenderChanges = response.data.message
        }, function myError(response) {
            console.log("error");
            console.log("response: " + JSON.stringify(response));
            $scope.myWelcome = response.statusText;
            // $location.path("/customerLogin");
        })

        $scope.temperatureUpdated = () => {
            console.log("temperature: ", $scope.temperature);
            var port = window.location.port;
            var socket = io.connect(window.location.host + '/user', { transports: ['websocket'] });
            socket.emit('temperatureUpdated', { 'clientType': getClientType(), 'temperature': $scope.temperature })
            $scope.temperature = '';

            socket.on('updatedRenderPercentage', (err, res) => {
                console.log("***************8888");
                if (!err) {
                    console.log("pushed,res: ", res.message);
                    $scope.RenderChanges.unshift(res.message);
                    $scope.$apply();
                } else {
                    console.log("err: ", err.stack);
                }
            })
        }
    })
    .controller('customerDashboard', function ($scope, $routeParams, $http, $location, $rootScope) {
        $http.post('/customer/api/v1.0/viewCustomer', {}).then(function mySuccess(response) {
            // console.log("dashboard accessed successfully,res: " + JSON.stringify(response));
            $scope.myAuctions = response.data
            $rootScope.isCustomer = true;
            $rootScope.isSupplier = false;
        }, function myError(response) {
            console.log("error");
            console.log("response: " + JSON.stringify(response));
            $scope.myWelcome = response.statusText;
            $location.path("/customerLogin");
        })

        $scope.getAuctionDetails = (auctionId) => {
            console.log("auctionId: ", auctionId);
            $location.path('/auction/' + auctionId)
        }
    })
    .controller('createAuction', function ($scope, $routeParams, $http, $location, $rootScope) {

        $scope.auctionCreationProducts = {
            'products': [
                {
                    "name": "p11",
                    "pid": 1,
                    "startPrice": ''
                }
            ]
        }
        $scope.createAuctionForm = {};
        $scope.createAuction = (startPrice) => {
            console.log("$scope.startPrice: " + $scope.startPrice);
            console.log("startPrice: " + startPrice);
            if (!$scope.startPrice) {
                // window.alert('startPrice empty')
            }
            var auctionCreationProducts = {
                'products': [
                    {
                        "name": "p11",
                        "pid": 1,
                        "startPrice": startPrice
                    }
                ],
                "startTime": "2018-02-14T13:15:35.303Z",
                "endTime": "2018-02-14T13:21:35.303Z"
            }

            $http.post('/customer/api/v1.0/createAuction', auctionCreationProducts).then(function mySuccess(response) {
                console.log("createAuction successfully,res: " + JSON.stringify(response));
                $scope.myAuctions = response.data
                $location.path("/customerDashboard");
            }, function myError(response) {
                console.log("error");
                console.log("response: " + JSON.stringify(response));
                $scope.myWelcome = response.statusText;
                $location.path("/customerLogin");
            })
        }


        $scope.getAuctionDetails = (auctionId) => {
            console.log("auctionId: ", auctionId);
            $location.path('/auction/' + auctionId)
        }
    })
    .controller('getAuction', function ($scope, $routeParams, $http, $location, $route, $timeout, $rootScope) {
        console.log("inside getAuction ", $routeParams.auctionId);
        var auctionId = parseInt($routeParams.auctionId);
        var socket = io.connect('http://localhost:8083/Auction', { transports: ['websocket'] });
        var roomName = 'AUC-' + auctionId
        socket.emit('connectToRoom', roomName);
        socket.emit('getAuction', { auctionId })
        $scope.data1 = 'data1'
        $scope.dataLoaded = false;
        console.log($scope.dataLoaded);
        console.log("$scope.isSupplier1 : ", $scope.isSupplier);

        socket.on('currentAuction', data => {
            $scope.data2 = 'data2'

            console.log("currentAuction data", data);
            // $timeout(function () {
            $scope.auctionDetatils = data.message.auction;
            $scope.bidDetatils = data.message.bids;
            $scope.$apply();
            // }, 0);

            $scope.dataLoaded = true;
            console.log($scope.dataLoaded);
            console.log("$scope.auctionDetatils: ", JSON.stringify($scope.auctionDetatils));
        })
        $scope.submitBid = (productId, price) => {
            console.log("inside submitBid: ", productId, price, auctionId);
            socket.emit('submitBid', {
                auctionId,
                productId,
                price,
                roomName
            })
        }

        socket.on('newBidReceived', data => {
            console.log("newBidReceived: ", data);
            console.log(JSON.stringify(data));
            // $timeout(function () {
            // $scope.auctionDetatils = data;
            $scope.auctionDetatils = data.message.auction;
            console.log("1:", $scope.bidDetatils.length);
            console.log("new bid: ", JSON.stringify(data.message.newBid));
            $scope.bidDetatils.unshift(data.message.newBid)
            console.log("2:", $scope.bidDetatils.length);

            $scope.bidPrice = '';
            // $route.reload();
            // }, 0);
            $rootScope.$broadcast('newBidReceived');
        })

        $scope.$on('newBidReceived', function (event) {
            // $scope.increment++;
            console.log("broadcasted newBidReceived");
            // $timeout(function () {
            $scope.auctionDetatils = $scope.auctionDetatils
            $scope.bidDetatils = $scope.bidDetatils
            $scope.bidPrice = '';
            // $route.reload();
            $scope.$apply();
            // }, 0);
        });

    })
var getClientType = () => {
    var isMobile = window.mobilecheck = function () {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }
    if (isMobile()) {
        return 'Mobile'
    } else {
        return 'Desktop'
    }
}
