(function() {
	var app = angular.module("portfolio", ['ui.router', 'ngAnimate', 'ui.bootstrap']);

	app.config(function ($stateProvider, $urlRouterProvider) {
			$urlRouterProvider.otherwise('modal');
	
			$stateProvider.state('base', {
				url: ''
			});

			$stateProvider.state('modal', {
				url: "",
				views:{
					"modal": {
						templateUrl: "partials/modal.html"
					}
				},
				onEnter: function($state){
					// Hitting the ESC key closes the modal
					$(document).on('keyup', function(e){
						if(e.keyCode == 27){
							$(document).off('keyup')
							$state.go('base')
						}
					});
				
					// Clicking outside of the modal closes it
					$(document).on('click', '.Modal-backdrop, .Modal-holder', function() {
						$state.go('base');
					});
				
					// Clicking on the modal or it's contents doesn't cause it to close
					$(document).on('click', '.Modal-box, .Modal-box *', function(e) {
						e.stopPropagation();
					});
				},
				abstract: true
			});

			$stateProvider.state('modal.disney', {
				views:{
					"modal": {
						templateUrl: 'partials/modalDisney.html'
					}
				}
			});
			$stateProvider.state('modal.rawdata', {
				views:{
					"modal": {
						templateUrl: 'partials/modalRawData.html'
					}
				}
			});
			$stateProvider.state('modal.vax', {
				views:{
					"modal": {
						templateUrl: 'partials/modalVax.html'
					}
				}
			});
			$stateProvider.state('modal.xcom2', {
				views:{
					"modal": {
						templateUrl: 'partials/modalXCom2.html'
					}
				}
			});
			$stateProvider.state('modal.adultswim', {
				views:{
					"modal": {
						templateUrl: 'partials/modalAdultSwim.html'
					}
				}
			});
			$stateProvider.state('modal.theblu', {
				views:{
					"modal": {
						templateUrl: 'partials/modalTheBlu.html'
					}
				}
			});
			$stateProvider.state('modal.bloom', {
				views:{
					"modal": {
						templateUrl: 'partials/modalBloom.html'
					}
				}
			});
			$stateProvider.state('modal.streetsofindia', {
				views:{
					"modal": {
						templateUrl: 'partials/modalStreetsOfIndia.html'
					}
				}
			});
			$stateProvider.state('modal.rasterizer', {
				views:{
					"modal": {
						templateUrl: 'partials/modalRasterizer.html'
					}
				}
			});
			$stateProvider.state('modal.marchingcubes', {
				views:{
					"modal": {
						templateUrl: 'partials/modalMarchingCubes.html'
					}
				}
			});
			$stateProvider.state('modal.skeletalanim', {
				views:{
					"modal": {
						templateUrl: 'partials/modalSkeletalAnim.html'
					}
				}
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

	app.directive("projectInfo", function() {
		return {
			restrict: "E",
			transclude: true,
			templateUrl: "partials/projectInfo.html",
			scope: {
				
			}
		};
	});

	app.directive("videoItem", function($sce) {
		return {
			restrict: "E",
			transclude: true,
			templateUrl: "partials/video.html",
			scope: {
				title: '@',
				code: '@'
			},
			link: function(scope, element, attrs, ctrl, transclude) {
				scope.$watch('code', function(newVal)
				{
					if (newVal)
					{
						scope.url = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + newVal);
					}
				});
			}
		};
	});
	app.directive("imageItem", function() {
		return {
			restrict: "E",
			transclude: true,
			templateUrl: "partials/image.html",
			scope: {
				title: '@',
				url: '@'
			},
			link: function(scope) {
				
			}
		};
	});

})();
