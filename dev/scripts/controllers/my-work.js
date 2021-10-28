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
    console.log('$scope.projects: ',$scope.projects);
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