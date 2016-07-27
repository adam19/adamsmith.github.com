(function() {
	var app = angular.module("portfolio", ['ui.router', 'ngAnimate', 'ui.bootstrap', 'anguvideo']);

	app.config(function ($stateProvider, $urlRouterProvider) {
			$urlRouterProvider.otherwise('/home');

			$stateProvider.state('/home', {
				templateUrl: '',
				controller: function() {
					
				}
			});

			$stateProvider.state('/xcom2', {
				url: '/xcom2',
				templateUrl: 'partials/modalXCom2.html'
			});
			$stateProvider.state('/adultswim', {
				url: '/adultswim',
				templateUrl: 'partials/modalAdultSwim.html'
			});
			$stateProvider.state('/theblu', {
				url: '/theblu',
				templateUrl: 'partials/modalTheBlu.html'
			});
			$stateProvider.state('/bloom', {
				url: '/bloom',
				templateUrl: 'partials/modalBloom.html'
			});
			$stateProvider.state('/streetsofindia', {
				url: '/streetsofindia',
				templateUrl: 'partials/modalStreetsOfIndia.html'
			});
			$stateProvider.state('/rasterizer', {
				url: '/rasterizer',
				templateUrl: 'partials/modalRasterizer.html'
			});
			$stateProvider.state('/marchingcubes', {
				url: '/marchingcubes',
				templateUrl: 'partials/modalMarchingCubes.html'
			});
			$stateProvider.state('/skeletalanim', {
				url: '/skeletalanim',
				templateUrl: 'partials/modalSkeletalAnim.html'
			});
		}
	);

	app.directive("projectItem", function() {
		return {
			restrict: "E",
			transclude: true,
			templateUrl: "partials/projectItem.html",
			scope: {
				bgimage: '@',
				projname: '@',
				state: '@'
			},
			link: function(scope, element, attrs, ctrl, transclude) {

			}
		};
	});

	// https://angular-ui.github.io/bootstrap/
	app.controller("ModalWindow", function($scope, $uibModal, $log) {
		$scope.items = ['item1', 'item2', 'item3'];
		$scope.animationsEnabled = true;

		$scope.open = function(modalContentUrl) {
			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				//templateUrl: 'partials/modalContent.html',
				templateUrl: modalContentUrl,
				controller: 'ModalInstCtrl',
				size: 'lg',
				resolve: {
					items: function() {
						return $scope.items;
					}
				}
			});

			modalInstance.result.then(function(selectedItem) {
				$scope.selected = selectedItem;
			}, function() {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};
	});
	app.controller('ModalInstCtrl', function ($scope, $uibModalInstance, items) {

		$scope.items = items;
		$scope.selected = {
			item: $scope.items[0]
		};

		$scope.ok = function () {
			$uibModalInstance.close($scope.selected.item);
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});
})();
