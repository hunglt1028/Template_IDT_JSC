/*-----------------------------------------------------------------------------------

	Theme Name: Clinton-Macomb Public Library
	Front-end developer: Hayk Galoyan
	Author Design: Jacob Nagy
	Author URI: http://www.revize.com/
	Date: 06/21/2023

-----------------------------------------------------------------------------------*/

(function($) {

	'use strict';

	var $window = $(window),
		$body = $('body');

	/*!
	 * IE10 viewport hack for Surface/desktop Windows 8 bug
	 * Copyright 2014-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 */

	// See the Getting Started docs for more information:
	// http://getbootstrap.com/getting-started/#support-ie10-width
	if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
		var msViewportStyle = document.createElement('style');
		msViewportStyle.appendChild(
			document.createTextNode(
			  '@-ms-viewport{width:auto!important}'
			)
		); document.querySelector('head').appendChild(msViewportStyle);
	}


	// Keyboard Navigation: Nav, flyout
	var isClick = false;
	$("#nav li a, #flyout  li a, a, button, .toggle, .toggle2").on('focusin', function(e) {
		if( isClick === false ) {
			$(".focused").removeClass("focused");
			$(e.currentTarget).parents("#nav li, #flyout li").addClass("focused");
			$(".opened:not(.focused) ul:visible,.opened2:not(.focused) ul:visible").slideUp().parent().removeClass("opened opened2");
		} else {
			$(".focused").removeClass("focused");
			isClick = false;
		}
	});

	// prevent focused class changes on click - This way arrows wont pop when clicking nav links
	$("#nav a,#flyout a").on('mousedown',function(){
		isClick = true;
	});

	// Navigation Toggle
	$("#nav-toggle").on("click", function(){
		$("#nav").stop().slideToggle();
		$(this).toggleClass("active");
		$("#header-right").hide();

		if ($(this).hasClass('active')) {
			$(this).removeClass('fa-bars').addClass('fa-times');
			$('#info-toggle').removeClass('active');
		} else {
			$(this).removeClass('fa-times').addClass('fa-bars');
		}

		$('#info-toggle').removeClass('fa-times').addClass('fa-info');
	});

	// Info Toggle
	$("#info-toggle").on("click", function(){
		$("#header-right").stop().slideToggle().css('display', 'flex');
		$(this).toggleClass("active");
		$("#nav").hide();

		if ($(this).hasClass('active')) {
			$(this).removeClass('fa-info').addClass('fa-times');
			$('#nav-toggle').removeClass('active');
		} else {
			$(this).removeClass('fa-times').addClass('fa-info');
		}

		$('#nav-toggle').removeClass('fa-times').addClass('fa-bars');
	});

	// Menu Arrows and Toggles
	$("#nav >li>ul,#flyout >li>ul").addClass('first-level');
	$("#nav  li ul ul").addClass('second-level');
	$("#nav>li:has(ul)").each(function(){
		$('<a href="#" class="fa fa-angle-down toggle" tabindex="0" aria-haspopup="true" aria-expanded="false" id="dropdown-toggle-'+$(this).index()+'" aria-label="Show Dropdown for '+ $(this).find('a:first').text() +'"></a>').insertAfter($(this).find('a:first'));
		$(this).find('ul:first').attr('aria-labelledby', 'dropdown-toggle-'+$(this).index());
	});
	$('#nav li ul>li:has(ul)').each(function(index) {
		$('<a href="#" class="fa fa-angle-down toggle2" tabindex="0" aria-haspopup="true" aria-expanded="false" id="sub-dropdown-toggle-'+index+'" aria-label="Show Dropdown for '+ $(this).find('a:first').text() +'"></a>').insertAfter($(this).find('a:first'));
		$(this).find('ul:first').attr('aria-labelledby', 'sub-dropdown-toggle-'+index);
	});
	$('#flyout >li:has(ul)').each(function() {
		$('<a href="#" class="fa fa-angle-down toggle" tabindex="0" aria-haspopup="true" aria-expanded="false" id="flyout-dropdown-toggle-'+$(this).index()+'" aria-label="Show Flyout for '+ $(this).find('a:first').text() +'"></a>').insertAfter($(this).find('a:first'));
		$(this).find('ul:first').attr('aria-labelledby', 'flyout-dropdown-toggle-'+$(this).index());
	});

	function addNavClass() {
		if ($window.width() < 992) {
			// Insert needed for mobile
		} else{
			// Insert needed for desktop
			$('#nav ul, #flyout ul').css('display', '');
		}
	}
	addNavClass();
	$window.resize(addNavClass);

	$(".toggle").on("click keydown",function(e) {
		if (e.keyCode === 13 || e.type === 'click') {
			e.preventDefault();
			var $parent = $(this).parent();
			var $parentLi = $parent.parent();
			$parent.toggleClass('opened');
			if($parent.addClass('active') && $(this).next('.first-level').is(":visible")){
				$(this).next('.first-level').slideUp();
				$parent.removeClass('active');
				$(this).attr({'aria-expanded': 'false'});
			} else {
				$(this).attr({'aria-expanded': 'true'});
				$(".first-level").slideUp("slow");
				$parent.addClass('active');
				$(this).next('.first-level').slideToggle();
			}
		}
	});
	$(".toggle2").on("click keydown",function(e) {
		if (e.keyCode === 13 || e.type === 'click') {
			e.preventDefault();
			var $parent = $(this).parent();
			var $parentLi = $parent.parent();
			$parent.toggleClass('opened2');
			if($parent.addClass('active') && $(this).next('.second-level').is(":visible")){
				$(this).next('.second-level').slideUp();
				$parent.removeClass('active');
				$(this).attr({'aria-expanded': 'false'});
			} else {
				$(this).attr({'aria-expanded': 'true'});
				$(".second-level").slideUp("slow");
				$parent.addClass('active');
				$(this).next('.second-level').slideToggle();
			}
		}
	});

	// close nav if left
	$(".desktop *").focus(function(e){
		var $opened = $(".opened");
		var $opened2 = $(".opened2");
		if( $opened.length > 0 || $opened2.length > 0 ) {
			if( $(".opened :focus").length < 1 ){
				$opened.children("ul").slideUp();
				$opened.removeClass("opened");
				$(".opened2").removeClass("opened2");
			}
			if( $(".opened2 :focus").length < 1 ){
				$opened2.children("ul").slideUp();
				$opened2.removeClass("opened2");
			}
		}
	});

	// Flyout
	var flyout = $('#flyout'),
		flyoutwrap = $('#flyout-wrap');

	if (flyout.text().length){
		flyoutwrap.prepend('<div id="flyout-toggle" class="d-xl-none d-lg-none"><i class="fa fa-bars"></i> Sub Menu</div>');
	}

	$("#flyout-toggle").on("click", function(){
		flyout.slideToggle();
		$(this).toggleClass("active");
	});

	// Alert Close Caching
	if ($("div.alert").length) {
		var hide = window.sessionStorage && parseInt(window.sessionStorage.getItem("alertClosed")) > 1;
		if (!hide || $(".user-logged-in").length != 0) {
			$("div.alert").addClass('show');
		}
		$("div.alert button.close").on('click', function(e) {
			if (window.sessionStorage) {
				window.sessionStorage.setItem("alertClosed",parseInt(window.sessionStorage.getItem("alertClosed")||0)+1);
			}
		});
	}

	// Tabs
	$('#tabs li a').on('click keypress', function(e) {
		if (e.keyCode === 13 || e.type === 'click') {
			$('#tabs li, #tabs-content .current').removeClass('current').removeClass('fadeInLeft');
			$(this).parent().addClass('current');

			var currentTab = $(this).attr('href');

			e.preventDefault();
			$(currentTab).addClass('current animated fadeInLeft');
			$(currentTab).find('h2').focus();
		}
	});

	var $translateButton = $('#translate-button');
	$translateButton.on('keydown click', function(e){
		if (e.keyCode === 13 || e.type === 'click') {
			$('#translation-links ul').stop().fadeToggle();
			$translateButton.attr('aria-expanded', !('true' === $translateButton.attr('aria-expanded')));
		}
	});
	
	$('#translation-links ul').on('mouseleave',function(){
		$(this).fadeOut();
		$translateButton.attr('aria-expanded', false);
	});
	// Tiny Slider
	if (typeof tns !== "undefined") {
		$('.tiny-slider').each(function(i, el) {
			tns({
				autoplay: true,
				autoplayTimeout: 8000,
				container: el,
				items: 1,
				lazyload: true,
				lazyloadSelector: '.tns-lazy-img', // accompanied with data src or data-style
				mode: "gallery"
			});
		});

		$('#quick-links-carousel').each(function(i, el) {
			var $el = $(el);
			var quickLinksCount = $el.children().length;
			function quickLinksItems(cnt) {return quickLinksCount > cnt ? cnt : quickLinksCount;}

			tns({
				container: el,
				loop: false,
				gutter: 35,
				responsive: {
					0: {
						items: quickLinksItems(1),
					},
					480: {
						items: quickLinksItems(2),
					},
					768: {
						items: quickLinksItems(3),
					},
					992: {
						items: quickLinksItems(4),
					},
					
				}
			});
		});
		$('#quick-links-carousel').each(function(i, el) {
			var $el = $(el);
			var quickLinksCount = $el.children().length;
			function quickLinksItems(cnt) {return quickLinksCount > cnt ? cnt : quickLinksCount;}

			tns({
				container: el,
				loop: false,
				gutter: 35,
				responsive: {
					0: {
						items: quickLinksItems(1),
					},
					480: {
						items: quickLinksItems(2),
					},
					768: {
						items: quickLinksItems(3),
					},
					992: {
						items: quickLinksItems(4),
					},
					
				}
			});
		});
		$('#new-books').each(function(i, el) {
			var $el = $(el);
			var quickLinksCount = $el.children().length;
			function quickLinksItems(cnt) {return quickLinksCount > cnt ? cnt : quickLinksCount;}

			tns({
				container: el,
				loop: false,
				gutter: 0,
				responsive: {
					0: {
						items: quickLinksItems(2),
					},
					480: {
						items: quickLinksItems(2),
					},
					768: {
						items: quickLinksItems(4),
					},
					992: {
						items: quickLinksItems(5),
					},
					
				}
			});
		});
		$('.book-discussions .tns-nav').appendTo('.freeform-books-slider-nav-container');
		$('.freeform-books-slider').show();
	}

	// Responsive Tables
	$('.post table:not(.layout-table):not(.not-responsive)').wrap('<div class="table-responsive"></div>');
	$('.layout-table').attr('role', 'presentation');

	// Preloader
	$window.on('load', function() {

		setTimeout(function(){
			$body.addClass('loaded');
			 $('#loader-wrapper').fadeOut();
		}, 600);

	});

	$window.ready(function(){

		// matchHeight
		if(typeof $.fn.matchHeight !== "undefined"){
			$('.equal').matchHeight({
				//defaults
				byRow: true,
				property: 'height', // height or min-height
				target: null,
				remove: false
			});
			$('.quick-link-title').matchHeight();
			$('.library-info').matchHeight();
			$('#nav .menuA.level0').attr('style','pointer-events:none');
		}

		// Animations http://www.oxygenna.com/tutorials/scroll-animations-using-waypoints-js-animate-css
		function onScrollInit( items, trigger ) {
			items.each( function() {
				var osElement = $(this),
					osAnimationClass = osElement.data('os-animation'),
					osAnimationDelay = osElement.data('os-animation-delay');

				osElement.css({
					'-moz-animation-delay':     osAnimationDelay,
					'animation-delay':          osAnimationDelay,
					'-webkit-animation-delay':  osAnimationDelay
				});

				var osTrigger = ( trigger ) ? trigger : osElement;

				if(typeof $.fn.waypoint !== "undefined"){
					osTrigger.waypoint(function() {
						osElement.addClass('animated').addClass(osAnimationClass);
					},{
						triggerOnce: true,
						offset: '100%'
					});
				}
			});
		}
		onScrollInit($('.os-animation'));

		// Skip to main content
		$('#skip').click(function(e){
			e.preventDefault();
			$(this).blur();

			var target = $(this.hash);
			var point = $('body').attr('id') == 'homepage' ? 150 : 90;
			$('html,body').animate({
				scrollTop: target.offset().top - point
			}, 1000);

			$(this).removeAttr('tabindex');
		});

		/*global jQuery */
		/*!
		* FlexVerticalCenter.js 1.0
		*
		* Copyright 2011, Paul Sprangers http://paulsprangers.com
		* Released under the WTFPL license
		* http://sam.zoy.org/wtfpl/
		*
		* Date: Fri Oct 28 19:12:00 2011 +0100
		*/
		$.fn.flexVerticalCenter = function( options ) {
			var settings = $.extend({
				cssAttribute:   'margin-top', // the attribute to apply the calculated value to
				verticalOffset: 0,            // the number of pixels to offset the vertical alignment by
				parentSelector: null,         // a selector representing the parent to vertically center this element within
				debounceTimeout: 25,          // a default debounce timeout in milliseconds
				deferTilWindowLoad: false     // if true, nothing will take effect until the $(window).load event
			}, options || {});

			return this.each(function(){
				var $this   = $(this); // store the object
				var debounce;

				// recalculate the distance to the top of the element to keep it centered
				var resizer = function () {

					var parentHeight = (settings.parentSelector && $this.parents(settings.parentSelector).length) ?
						$this.parents(settings.parentSelector).first().height() : $this.parent().height();

					$this.css(
						settings.cssAttribute, ( ( ( parentHeight - $this.height() ) / 2 ) + parseInt(settings.verticalOffset) )
					);
				};

				// Call on resize. Opera debounces their resize by default.
				$(window).resize(function () {
					clearTimeout(debounce);
					debounce = setTimeout(resizer, settings.debounceTimeout);
				});

				if (!settings.deferTilWindowLoad) {
					// call it once, immediately.
					resizer();
				}

				// Call again to set after window (frames, images, etc) loads.
				$(window).on('load', function () {
					resizer();
				});

			});

		};
		$('.v-align').flexVerticalCenter();

	}); // Ready

	// Alert section
	$('#alert-closebtn').on('click', function(){
		$('#app-alert').slideUp(300);
	})

	// Menu scroll if long
	if (!$('header #nav li .nav-in-wrap').length) {
		$('header .first-level').wrapInner('<div class="nav-in-wrap"><div class="nav-in container"><div class="nav-in-menu-wrap"></div></div></div>');
	}

	/* For mega menu */
	$('.nav-content').each(function(){
		var navContentIndex = $(this).index();
		$(this).clone().appendTo($('#nav>li').eq(navContentIndex).find('.first-level .nav-in'));
	});

	function scrollFunction() {
		if (document.documentElement.scrollTop > 0) {
			var appAlertHeight = 0
			if($('#app-alert').is(':visible')) {
				appAlertHeight = $("#app-alert").height();
				appAlertHeight = '-' + appAlertHeight + 'px';
			}
			$('#homepage header').css('transform', 'translateY(' + appAlertHeight + ')');

			$('#logo-wrap').css('margin-top', 0);
			$('#logo-wrap img').css('width', 72);

			$('#search-wrap').css('margin-top', 0);
		} else {
			$('#homepage header').css('transform', 'translateY(0)');

			$('#logo-wrap').css('margin-top', 15);
			$('#logo-wrap img').css('width', 129);

			$('#search-wrap').css('margin-top', 75);
		}
	}

	var matchMediaQuery = window.matchMedia("(min-width: 992px)");
	
	function manageHeader(matchMediaQuery) {
		if (matchMediaQuery.matches) {
			scrollFunction();
			window.onscroll = function() {scrollFunction()};

			$('#nav>li').hover(
				function(){
					var navIn = $(this).find('.nav-in');
					var firstLevel = $(this).find('.first-level');
					var point = 600;
						
					if (navIn.height() > point) {
						firstLevel.css({
							height: point,
							'overflow-y': 'auto',
							'overscroll-behavior': 'contain'
						});
					}
				},
				function(){
					$(this).find('.first-level').css({
						height: 'auto',
						'overflow-y': 'visible'
					})
				}
			);
		} else {
			window.onscroll = null;

			$('#nav>li').unbind('mouseenter mouseleave');
			$('ul.first-level').css('height', 'auto');
		}
	}

	manageHeader(matchMediaQuery);
	matchMediaQuery.addListener(manageHeader);

	// library tabs
	$('.library-tab').click(function(){
		var tabIndex = $(this).index();
		$('.library-tab').removeClass('current');
		$(this).addClass('current');

		$('.library-tab-content').removeClass('current');
		$('.library-tab-content').eq(tabIndex).addClass('current');

		$('.library-tab-content').stop().hide();
		$('.library-tab-content').eq(tabIndex).stop().fadeIn(0);
	})

	// Top alert start/end date
	var alertStart = new Date($('#app-alert').attr('data-alert-start')+'T00:00:00');
	var alertEnd = new Date($('#app-alert').attr('data-alert-end')+'T00:00:00');
	var currentDate = new Date();

	if (!isNaN(alertStart) && !isNaN(alertEnd)) {
		if (currentDate > alertStart && currentDate < alertEnd) {
			setTimeout(function(){
				$('#app-alert').slideDown();
			}, 300)
		} else {
			$('#app-alert').hide();
		}
	} else {
		console.log('Alert start day - ' + alertStart, '\nAlert end day - ' + alertEnd);
	}

	//
	$('#nav>li:nth-of-type(4) a:first').on('click', function(){return false});

})(jQuery);