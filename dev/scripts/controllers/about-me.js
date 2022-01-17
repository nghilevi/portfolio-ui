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