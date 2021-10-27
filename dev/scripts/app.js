// -------------------------------- autocomplete.js --------------------------------
/* --- Made by justgoscha and licensed under MIT license --- */

var autocomplete = angular.module('autocomplete', []);

autocomplete.directive('autocomplete', ['$timeout',function($timeout) {
  var index = -1;

  return {
    restrict: 'E',
    scope: {
      searchParam: '=ngModel',
      suggestions: '=data',
      onType: '=onType',
      onSelect: '=onSelect',
      autocompleteRequired: '='
    },
    controller: ['$scope', function($scope){
      // the index of the suggestions that's currently selected
      $scope.selectedIndex = -1;

      $scope.initLock = true;

      // set new index
      $scope.setIndex = function(i){
        $scope.selectedIndex = parseInt(i);
      };

      this.setIndex = function(i){
        $scope.setIndex(i);
        $scope.$apply();
      };

      $scope.getIndex = function(i){
        return $scope.selectedIndex;
      };

      // watches if the parameter filter should be changed
      var watching = true;

      // autocompleting drop down on/off
      $scope.completing = false;

      // starts autocompleting on typing in something

      $scope.$watch('searchParam', function(newValue, oldValue){
        if (oldValue === newValue || (!oldValue && $scope.initLock)) {
          return;
        }

        if(watching && typeof $scope.searchParam !== 'undefined' && $scope.searchParam !== null) {
          $scope.completing = true;
          $scope.searchFilter = $scope.searchParam;
          $scope.selectedIndex = -1;
        }

        // function thats passed to on-type attribute gets executed
        
        if($scope.onType){
          $scope.onType($scope.searchParam);     
        }
      });

      // for hovering over suggestions
      this.preSelect = function(suggestion){

        watching = false;

        // this line determines if it is shown
        // in the input field before it's selected:
        //$scope.searchParam = suggestion;

        $scope.$apply();
        watching = true;

      };

      $scope.preSelect = this.preSelect;

      this.preSelectOff = function(){
        watching = true;
      };

      $scope.preSelectOff = this.preSelectOff;

      // selecting a suggestion with RIGHT ARROW or ENTER
      $scope.select = function(suggestion){
        if(suggestion){
          $scope.searchParam = suggestion;
          $scope.searchFilter = suggestion;
          if($scope.onSelect)
            $scope.onSelect(suggestion);
        }
        watching = false;
        $scope.completing = false;
        setTimeout(function(){watching = true;},1000);
        $scope.setIndex(-1);
      };


    }],
    link: function(scope, element, attrs){
      console.log('element',element);

      setTimeout(function() {
        scope.initLock = false;
        scope.$apply();
      }, 250);

      var attr = '';

      // Default atts
      scope.attrs = {
        "placeholder": "start typing...",
        "class": "",
        "id": "",
        "inputclass": "",
        "inputid": ""
      };

      for (var a in attrs) {
        attr = a.replace('attr', '').toLowerCase();
        // add attribute overriding defaults
        // and preventing duplication
        if (a.indexOf('attr') === 0) {
          scope.attrs[attr] = attrs[a];
        }
      }

      if (attrs.clickActivation) {
        element[0].onclick = function(e){
          if(!scope.searchParam){
            setTimeout(function() {
              scope.completing = true;
              scope.$apply();
            }, 200);
          }
        };
      }

      var key = {left: 37, up: 38, right: 39, down: 40 , enter: 13, esc: 27, tab: 9};

      document.addEventListener("keydown", function(e){
        var keycode = e.keyCode || e.which;

        switch (keycode){
          case key.esc:
            // disable suggestions on escape
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
        }
      }, true);

      document.addEventListener("blur", function(e){
        // disable suggestions on blur
        // we do a timeout to prevent hiding it before a click event is registered
        setTimeout(function() {
          scope.select();
          scope.setIndex(-1);
          scope.$apply();
        }, 150);
      }, true);

      element[0].addEventListener("keydown",function (e){
        var keycode = e.keyCode || e.which;

        var l = angular.element(this).find('li').length;

        // this allows submitting forms by pressing Enter in the autocompleted field
        if(!scope.completing || l == 0) return;

        // implementation of the up and down movement in the list of suggestions
        switch (keycode){
          case key.up:

            index = scope.getIndex()-1;
            if(index<-1){
              index = l-1;
            } else if (index >= l ){
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              break;
            }
            scope.setIndex(index);

            if(index!==-1)
              scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

            scope.$apply();

            break;
          case key.down:
            index = scope.getIndex()+1;
            if(index<-1){
              index = l-1;
            } else if (index >= l ){
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              scope.$apply();
              break;
            }
            scope.setIndex(index);

            if(index!==-1)
              scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

            break;
          case key.left:
            break;
          case key.right:
          case key.enter:
          case key.tab:

            index = scope.getIndex();
            // scope.preSelectOff();
            if(index !== -1) {
              scope.select(angular.element(angular.element(this).find('li')[index]).text());
              if(keycode == key.enter) {
                e.preventDefault();
              }
            } else {
              if(keycode == key.enter) {
                scope.select();
              }
            }
            scope.setIndex(-1);
            scope.$apply();

            break;
          case key.esc:
            // disable suggestions on escape
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
            break;
          default:
            return;
        }

      });
    },
    template: '\
        <div class="autocomplete {{ attrs.class }}" id="{{ attrs.id }}">\
          <input\
            type="text"\
            ng-model="searchParam"\
            placeholder="{{ attrs.placeholder }}"\
            class="{{ attrs.inputclass }}"\
            id="{{ attrs.inputid }}"\
            ng-required="{{ autocompleteRequired }}" />\
          <ul ng-show="completing && (suggestions | filter:searchFilter).length > 0">\
            <li\
              suggestion\
              ng-repeat="suggestion in suggestions | filter:searchFilter | orderBy:\'toString()\' track by $index"\
              index="{{ $index }}"\
              val="{{ suggestion }}"\
              ng-class="{ active: ($index === selectedIndex) }"\
              ng-click="select(suggestion)"\
              ng-bind-html="suggestion | highlight:searchParam"></li>\
          </ul>\
        </div>'
  };
}]);

autocomplete.filter('highlight', ['$sce', function ($sce) {
  return function (input, searchParam) {
    if (typeof input === 'function') return '';
    if (searchParam) {
      var words = '(' +
            searchParam.split(/\ /).join(' |') + '|' +
            searchParam.split(/\ /).join('|') +
          ')',
          exp = new RegExp(words, 'gi');
      if (words.length) {
        input = input.replace(exp, "<span class=\"highlight\">$1</span>");
      }
    }
    return $sce.trustAsHtml(input);
  };
}]);

autocomplete.directive('suggestion', function(){
  return {
    restrict: 'A',
    require: '^autocomplete', // ^look for controller on parents element
    link: function(scope, element, attrs, autoCtrl){
      element.bind('mouseenter', function() {
        autoCtrl.preSelect(attrs.val);
        autoCtrl.setIndex(attrs.index);
      });

      element.bind('mouseleave', function() {
        autoCtrl.preSelectOff();
      });
    }
  };
});

'use strict';

// -------------------------------- angular.js --------------------------------
var app = angular.module('vinhnghigithubioApp', [
    'ngAnimate',
    'ngResource',
    'ngRoute',
    'autocomplete'
]);

app.config(['$routeProvider',function ($routeProvider) {
  $routeProvider
    .when('/about-me', {
      templateUrl: 'dev/views/about-me.html',
      controller: 'about-me'
    })
    .when('/my-work', {
      templateUrl: 'dev/views/my-work.html',
      controller: 'my-work'
    })
    .otherwise({
      redirectTo: '/about-me'
    });
}]);

app.controller('menuLink', ['$scope','$location',function($scope,$location) {
  $("#menu").click(function() {
    $('html,body').scrollTop(0);
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

app.controller('about-me', ['$scope', function($scope) {
  var s = skrollr.init();
  $("#avt").click(function() {
      $('html, body').animate({
          scrollTop: 310
      }, 400);
  });

  $("#avt").hover(function() {
      $('#intro h1, #intro p').addClass("moving");
  },function() {
      $('#intro h1, #intro p').removeClass("moving");
  });

  
  //Animation while scrolling
  $(window).scroll(function() {
    //console.log("Width: "+$(window).width());
    //console.log($(this).scrollTop());
    //Slide 1
    if ($(this).scrollTop()>260){
        $('#slide-1 #intro').fadeOut();
     }else{
      $('#slide-1 #intro').fadeIn();
    }

    //Slide 2
    if ($(this).scrollTop()>=300 && $(this).scrollTop()<800){
        $('#slide-2 .caption.part1').fadeIn();
    }else{     
        $('#slide-2 .caption.part1').fadeOut();
    }

    if ($(this).scrollTop()>=800 && $(this).scrollTop()<1300){
        $('#slide-2 .caption.part2').fadeIn();
    }else{     
        $('#slide-2 .caption.part2').fadeOut();
    }      

    //Slide 3
    if ($(this).scrollTop()>1450 && $(this).scrollTop()<2300){
        $('#slide-3 .caption').fadeIn();
    }else{     
      $('#slide-3 .caption').fadeOut();
    }
   
   });
}]);
app.factory('autocompleteArrServ', [function() {

  var makeStatsArr=function(originArr){
      var statsArr=[];
      
      //make a stats obj: count the number of occurence of an elm in an array
      var statsObj = originArr.reduce(function (acc, curr) { 
        acc[curr] = (typeof acc[curr] == 'undefined') ? 1 : acc[curr]+1
        return acc;
      },{});

      //transform a statsObj to a stats array : {Web: 15} -> ["Web (15)"]
      for (var key in statsObj) {
        statsObj.hasOwnProperty(key) && statsArr.push(key+" ("+statsObj[key]+")"); //single line if
      }

      return statsArr;
  }

  var generateAutoCompleteArray = function(data){
    //Generate autocomplete array
    var projectNameArr=[],catArr=[],techArr=[];
    for (var i = 0; i < data.length; i++) { 
      projectNameArr.push(data[i].name);
      catArr=catArr.concat(data[i].cat.split(", "));
      techArr=techArr.concat(data[i].technologies.split(", ")); //split each tech word first, then concat
    }
    
    // What we want is a stat array, so instead ['Web', 'Web','Mobile'], we will have ['Web (2)','Mobile (1)']
    catArr=makeStatsArr(catArr); //categories
    techArr=makeStatsArr(techArr); // technologies

    return projectNameArr.concat(catArr,techArr);  
  }

  return{
    generate: generateAutoCompleteArray
  }

}])
.factory('back2Top', [function() {
  var init = function(){
    //Normal JS
    $('#back-to-top').hide();
    //Animation while scrolling
    $(window).scroll(function() {
      $(this).scrollTop()>1000 ? $('#back-to-top').fadeIn() : $('#back-to-top').fadeOut()
    });
    $("#back-to-top").click(function() { $('html,body').scrollTop(0); }); 
  }

  return {
    init: init
  }

}])
.controller('my-work', ['$scope', '$http','autocompleteArrServ','back2Top',
  function($scope, $http, autocompleteArrServ, back2Top) {


  var processData=function(data){
    $scope.projects = data;
    $scope.searchOrder = ['rankId'];
    //$scope.direction='reverse';
    $scope.autocomplete=autocompleteArrServ.generate(data);  
  }

  //var savedData = JSON.parse(localStorage.getItem('lvnPortfolio1.0.12')),
  var savedData,
      mode='production';
  

  //get data from local storage
  var loadData=function(savedData,mode){
    if(mode!='test'){
      if(!savedData){
        $http.get('dist/models/data.json').success(function(data) {
          processData(data);
          savedData = JSON.stringify($scope.projects);
          //localStorage.clear();
          //localStorage.setItem('lvnPortfolio1.0.12', savedData);
        });
      }else{
        processData(savedData);
      }
    }else{ //Test mode
      $http.get('dev/models/data.json').success(function(data) {
          processData(data);
          savedData = JSON.stringify($scope.projects);
      });
    }
  }
  
  //mode='test';
  loadData(savedData,mode);

  $scope.flip=function($event){
      $($event.currentTarget).toggleClass("flipped");
  }

  //On select a string/item on the autocomplete list
  $scope.selectItem=function(item){
    if(item[item.length-1]==")"){
        $scope.query = item.slice(0,item.indexOf("(")-1);
    }
  }

  back2Top.init();

}]);