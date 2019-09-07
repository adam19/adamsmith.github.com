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

		console.log("ProjectController $id=" + $scope.$id);

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

		$scope.setProjectByName = function(projectName)
		{
			var currentTitle = '';
			if ($scope.currentProject != null && $scope.currentProject.title != null)
			{
				currentTitle = $scope.currentProject.title;
			}

			console.log("setProjectByName('" + currentTitle + "' => '" + projectName + "')");

			for (var i=0; i<$scope.projectList.length; i++)
			{
				if ($scope.projectList[i].title == projectName)
				{
					$scope.currentProject = $scope.projectList[i];
				}
			}
		}
	}]);

	app.directive("projectModal", function($rootScope, $compile)
	{
		// 			// Clicking outside of the modal closes it
		// 			$(document).on('click', '.Modal-backdrop, .Modal-holder', function() {
		// 				$state.go('base');
		// 			});
		// 			$(document).on('click', '.Modal-box, .Modal-box *', function(e) {
		// 				e.stopPropagation();
		// 			});

		return {
			scope: {
				selectedProject: '=',
			},
			transclude: true,
			link: function(scope, element, attrs)
			{
				scope.projectName = "UNKNOWN PROJECT NAME";
				scope.leftSideData = [];
				scope.rightSideMedia = [];
				scope.isHidden = true;

				scope.setProjectData = function(projectData) 
				{
					scope.leftSideData = [];
					for(var para in projectData.leftContent)
					{
						//addParagraph(para);
						scope.leftSideData.push(para);
					}
				};

				var addParagraph = function(paragraphStr)
				{
					console.log("Adding paragraph: " + paragraphStr);

					var pElem = "<p>" + paragraphStr + "</p>";
					var newScope = scope.$new();
					var newElement = $compile(pElem)(newScope);
					element.append(newElement);
				}
			},
			templateUrl: "partials/modalTemplate.html"
		};
	})

	app.directive("projectItem", function() {
		return {
			restrict: "E",
			transclude: true,
			templateUrl: "partials/projectItem.html",
			scope: {
				bgimage: '@',
				projname: '@',
				setProjectByName: '&'
			},
			link: function(scope, element, attrs, ctrl, transclude) {
				scope.onClicked = function()
				{
					console.log("projectItem " + scope.$id + " clicked!");

					var projname = scope.projname;
					//scope.$parent.setProjectByName(scope.projname);
					scope.setProjectByName({projname: projname});



					// CONTINUE WORKING ON THIS SECTION TO GET THE SCOPE BINDINGS WORKING !!!



				}
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
