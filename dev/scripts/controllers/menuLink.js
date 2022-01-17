app.controller('menuLink', ['$scope','$location',function($scope,$location) {
  $("#menu").click(function() {
    $('html,body').scrollTop(0);
    $(".menu .pointer").hide()
  });
  $scope.location=$location;
  $scope.$watch('location.path()', function(path) {
    if($scope.location.path()=="/my-work"){
      $scope.menuLink="#about-me";
      $scope.menuText="About Me";
      
    }else{
      $scope.menuLink="#my-work";
      $scope.menuText="My Work";
    }
  });
  
}]);
