(function() {
	var app = angular.module("Portfolio", ['ui.router', 'ngAnimate', 'ui.bootstrap']);

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

				scope.$watch('selectedProject', function(newValue, oldValue)
				{
					scope.setProjectData(newValue);
				}, true);

				scope.setProjectData = function(projectData) 
				{
					if (!projectData)
						return;
						
					var idx;

					// Clear out the previous DOM elements
					for(var elem in scope.leftSideData)
					{
						scope.leftSideData[elem].html.innerHTML = "";
					}
					scope.leftSideData = [];

					for (var elem in scope.rightSideMedia)
					{
						scope.rightSideMedia[elem].innerHTML = "";
					}
					scope.rightSideMedia = [];

					idx = 0;
					for(var para in projectData.leftContent)
					{
						scope.leftSideData.push({
							html: addParagraph(projectData.leftContent[para]),
							id: idx
						});
						idx++;
					}

					idx = 0;
					for(var media in projectData.rightContent)
					{
						scope.rightSideMedia.push({
							html: projectData.rightContent[media],
							id: idx
						});

						/*
							* GENERATE THE MEDIA CONTENT AND ATTACH IT TO THE ELEMENT
							* http://jsfiddle.net/ADukg/16420/
						 */
					}
					
					scope.projectName = projectData.title;
				};

				var addParagraph = function(paragraphStr)
				{
					console.log("Adding paragraph: " + paragraphStr);

					var pElem = "<p>" + paragraphStr + "</p>";
					var newScope = scope.$new();
					var newElement = $compile(pElem)(newScope);
					return element.append(newElement)[0];
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
					scope.setProjectByName({projname: projname});
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
