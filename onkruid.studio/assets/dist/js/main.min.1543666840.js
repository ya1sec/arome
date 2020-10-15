/*global ga, History, Modernizr, FastClick, alert*/

window.main 			=	window.main || {};

var sitename = 'Onkruid';

var ww = $(window).width();
var wh = $(window).height();

var $htmlbody	= $('html,body');
var $body	= $('body');
var $listItem = $('.js-listitem');
var $btnToggleListitem = $('.js-toggle-listitem');
var $header = $('.js-header');
var headerHeight = $header.outerHeight();
var halfHeaderHeight = headerHeight / 2;

var animationSpeed = 440;

// Scroll variables
var didScroll = false;
var lastScrollPos = 0;
var scrollDownLastPosition = 0;
var scrollUpLastPosition = 0;
var scrollLastPosition = 0;
var scrollvalue,
    percentage;

// Checks
var isHomepage = false;
var isTouchdevice = false;

main.init = function () {

  main.initIntro();
  main.initPjax();
  main.checkOnScroll($(document).scrollTop());
	main.initEvents();
  main.setLayout();

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isTouchdevice = true;
    $body.addClass('is-touch');
    $body.addClass('is-mobile-device');
  }

	$(window).on('resize', function(){
		main.setLayout();
	});

};

main.initPjax = function() {

  //Functions to run on specific pages
  var Default = Barba.BaseView.extend({
    namespace: 'default',
    onEnter: function() {
      main.initEvents();

    }
  });

  var Projects = Barba.BaseView.extend({
    namespace: 'projects',
    onEnter: function() {
      main.initEvents();
      main.initList();
    }
  });

  var Project = Barba.BaseView.extend({
    namespace: 'project',
    onEnter: function() {
      main.initEvents();
      main.initSlider('.js-slider');
    },
    onLeaveCompleted: function() {
      main.destroySlider('.js-slider');
    }
  });

  Default.init();
  Projects.init();
  Project.init();

  //Start Barba
  Barba.Pjax.start();

  var FadeTransition = Barba.BaseTransition.extend({
    start: function() {
      Promise
        .all([this.newContainerLoading, this.fadeOut()])
        .then(this.fadeIn.bind(this));
    },

    fadeOut: function() {
      $(this.oldContainer).toggleClass('fade-out');
      return new Promise(function(resolve, reject) {
          window.setTimeout(function() {
            /*
            if(isNavToggled) {
              main.toggleNav();
            }
            */
            resolve();
          }, animationSpeed);
      });
    },

    fadeIn: function() {
      var $el = $(this.newContainer);
      $(this.newContainer).toggleClass('fade-in');
      console.log('New page name is = ' + $el.data('page'));
      main.updateNavigation($el.data('page'));
      main.scrollToTop();
      this.done();
    }
  });

  Barba.Pjax.getTransition = function() {
    return FadeTransition;
  };

};

main.updateNavigation = function(page) {
  $('.c-navigation-list-item').removeClass('is-active');
  $('.c-navigation-list-item[data-page='+page+']').addClass('is-active');
};

main.initIntro = function() {

  $body.scrollTop(0);
  $body.removeClass('preload');
  $body.on('click touch', function() {
      $body.addClass('is-loaded');
      $body.removeClass('no-scroll');
  });

  setTimeout(function() {
    $body.addClass('is-loaded');
    $body.removeClass('no-scroll');
  },880);

};

main.initEvents = function() {

  $listItem = $('.js-listitem');
  $btnToggleListitem = $('.js-toggle-listitem');
  $btnToggleProject = $('.js-toggle-project');

  $btnToggleListitem.off().on('click', function(e) {
    e.preventDefault();
    var content_to_load = $(this).attr('data-page');
    main.toggleListItem(content_to_load);
  });

  $btnToggleProject.off().on('click', function(e) {
    e.preventDefault();
    var content_to_load = $(this).attr('data-page');
    var content_href = $(this).attr('data-href');
    var content_title = $(this).attr('data-title');
    main.toggleProject(content_to_load, content_href, content_title);
  });

};


main.initList = function() {

  var options = {
    valueNames: ['name', 'location', 'status', 'client', 'year', 'type']
  };

  var projectsList = new List('projects-list', options);

  /*
  projectsList.sort('year', {
    order: "desc",
    insensitive: true
  });
  */

};

main.destroySlider = function(slider) {

  if ($(slider).length > 0) {
    $(slider).flickity('destroy');
  }

};

main.initSlider = function(slider) {

  if ($(slider).length > 0) {
    $(slider).removeClass('is-hidden');
    $(slider)[0].offsetHeight; // jshint ignore:line
    $(slider).flickity({
      cellSelector: '.js-slider__cell',
      cellAlign: 'left',
			wrapAround: true,
			autoPlay: true,
			//adaptiveHeight: true,
      contain: false,
			setGallerySize: true,
      prevNextButtons: false,
      pageDots: true
    });


    var flkty = $(slider).data('flickity');

    $('.js-slider__btn--previous').on( 'click', function() {
      $(slider).flickity('previous');
    });

    $('.js-slider__btn--next').on( 'click', function() {
      $(slider).flickity('next');
    });
  }

};

main.showContentBlock = function(clicked_listItem) {
  $(clicked_listItem).toggleClass('is-active');
  if($(clicked_listItem).hasClass('is-active')) {
    //$(clicked_listItem).find('.o-list-item__head').css({'position':'sticky'});
    $(clicked_listItem).find('.o-list-item__head').css({'top':$header.outerHeight() - 1});
    var $slider = $(clicked_listItem).find('.js-slider');
    main.initSlider($slider);
    setTimeout(function() {
      main.scrollTo(clicked_listItem);
    },50);
  } else {
    $('.o-list-item__head').css({'top':0});
  }
};

main.updatePage = function(content_to_load,content_href,content_title) {
  window.history.pushState(sitename, content_title, '/'+content_href);
};

main.toggleProject = function(content_to_load,content_href,content_title) {
  var clicked_listItem = '.js-listitem[data-page="'+content_to_load+'"]';
  main.showContentBlock(clicked_listItem);
  main.updatePage(content_to_load,content_href,content_title);
};

main.toggleListItem = function(content_to_load) {
  var clicked_listItem = '.js-listitem[data-page="'+content_to_load+'"]';
  main.showContentBlock(clicked_listItem);
};

main.scrollTo = function(href) {
  $('html:not(:animated), body:not(:animated)').animate({
    scrollTop: $(href).offset().top - (($header.outerHeight()) - 1)
  }, animationSpeed);

};

main.scrollToTop = function() {
  $('html:not(:animated), body:not(:animated)').animate({
    scrollTop: 0
  }, animationSpeed);
};

main.setLayout = function() {

  ww = $(window).width();
	wh = $(window).height();

  var logoHeight = $('.c-logo-container--main').outerHeight();
  $('.wrapper').css({'margin-top':logoHeight});

};

main.checkOnScroll = function(scrollPosition) {
  //Do something on scroll
};

//On Scroll
$(window).on('scroll', function(event) {

  didScroll = true;
  main.checkOnScroll($(this).scrollTop());

});

setInterval(function() {

  if (didScroll) {
    didScroll = false;
  }

}, 200);

$(main.init);
