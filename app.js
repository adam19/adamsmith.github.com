(function() {
	var app = angular.module("Portfolio", ['ui.router', 'ngAnimate', 'ui.bootstrap']);

	app.controller("ProjectController", ["$http", "$scope", function($http, $scope) {
		$scope.projectList = [];
		$scope.tagToProjectMap = [];
		$scope.currentProject = null;

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
			var proj = getProjectByName(projectName);
			$scope.currentProject = proj;
		}

		var getProjectByName = function(projectName)
		{
			for (var i=0; i<$scope.projectList.length; i++)
			{
				if ($scope.projectList[i].title == projectName)
				{
					return $scope.projectList[i];
				}
			}
		}

		

		$scope.onClicked = function()
		{
			console.log("projectController clicked!");
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
				currentProject: '=selectedProject'
			},
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
			},
			link: function(scope, element, attrs, ctrl, transclude) {
				scope.onClicked = function()
				{
					console.log("projectItem clicked!");
					scope.$parent.setProjectByName(scope.projname);
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
