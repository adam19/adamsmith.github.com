(function() {
	var app = angular.module("Portfolio", ['ui.router', 'ngAnimate', 'ui.bootstrap']);

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

	app.controller("ProjectController", ["$http", "$scope", function($http, $scope) {
		$scope.projectList = [];
		$scope.tagToProjectMap = [];

		$http.get("./projects.json").then(
			function success(response) {
				if (response && response.data && response.data.Projects)
				{
					$scope.projectList = response.data.Projects;

					populateTags($scope.projectList, $scope.tags);
				}
			},
			function error(response) {
				console.log("Error: " + response.statusText);
			}
		);

		var populateTags = function(projects, tags)
		{
			if (!projects)
			{
				return;
			}

			tags = [];

			for(var i=0; i<projects.length; i++)
			{
				var proj = projects[i];

				for(var j=0; j<proj.tags.length; j++)
				{
					if (!tags[proj.tags[j]])
					{
						tags[proj.tags[j]] = [];
					}

					tags[proj.tags[j]].push(proj.title);
				}
			}

			// for (var key in tags)
			// {
			// 	console.log(key + ":");
			// 	for (var i=0; i<tags[key].length; i++)
			// 	{
			// 		console.log("\t" + tags[key][i]);
			// 	}
			// }
		}
	}]);

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
