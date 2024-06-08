/*-----------------------------------------------------------------------------------

	Theme Name: Clinton-Macomb Public Library
	Front-end developer: Hayk Galoyan
	Author Design: Jacob Nagy
	Author URI: http://www.revize.com/
	Date: 06/21/2023

-----------------------------------------------------------------------------------*/

function RZRenderMini(elementList) {
	function buttonsVisibility(){
		$('#homepage .day-has-event a.fc-daygrid-day-number').on('click', function(){
			$('#homepage .fc-button-group').css('opacity', 1);
			$('#homepage .fc-toolbar-chunk .fc-dayGridMonth-button').css('opacity', 1);
			$('#homepage .fc-toolbar-chunk:nth-of-type(1) .fc-button-group:nth-of-type(1)').css('opacity', 0).css('pointer-events', 'none');
		})
	}

	$('#homepage .fc-toolbar-chunk .fc-dayGridMonth-button')
	.add('#homepage .fc-prev-button, #homepage .fc-next-button')
	.on('click', function(){
		$('#homepage .fc-button-group').css('opacity', 0);
		$('#homepage .fc-toolbar-chunk .fc-dayGridMonth-button').css('opacity', 0);
		$('#homepage .fc-toolbar-chunk:nth-of-type(1) .fc-button-group:nth-of-type(1)').css('opacity', 1).css('pointer-events', 'auto');;
		buttonsVisibility();
	});

	buttonsVisibility();
}

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

	// RZ Class
	if(typeof RZ !== "undefined"){
		if(RZ.login){
			$body.addClass("user-logged-in");
		} else{
			$body.addClass("user-not-logged-in");
		}
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

	/*
	* E-Notify Auto submit
	*/
	$.urlParam=function(n){var e=new RegExp("[?&]"+n+"=([^]*)").exec(window.location.href);return null==e?null:e[1]||0};
	var $enotify = $('iframe[src*="/revize/plugins/notify/notify.jsp"]');
	if( $enotify.length > 0 ){
		var emailStr = $.urlParam("email");
		if( emailStr != null ){
			$enotify.attr("src", $enotify.attr("src") + "&email=" + emailStr);
		}
	}

	// Make sure all calendars have unique ids
	$('iframe[name="calendar"]').each(function (index, calendar) {
		calendar.id = 'calendar-' + index;
	});

	// Start Frame Resizer
	function resizeIframe(height, frameElement) {
		if ( frameElement ) {
			frameElement.height = "";
			frameElement.height = height;
		}
	}

	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventHandler = window[eventMethod];
	var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
	eventHandler(messageEvent, function (e) {
		if ( Array.isArray(e.data) ) {
			if( e.data[0] === "setCalHeight" || e.data[0] === "setNotifyHeight") {
				var frames = document.querySelectorAll('iframe');
				for( var i = 0; i < frames.length; i++ ) {
					if( frames[i].contentWindow === e.source ){
						resizeIframe(e.data[1], frames[i]);
					}
				}
			}
		}
	});
	// End Frame Resizer

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

	function removeCookieString(value, domain) {
		domain = domain ? 'domain='+domain+'; ' : '';
		return value+'; expires=Thu, 01 Jan 1970 00:00:01 GMT; '+domain+'path=/';
	}

	function unsetGoogtransCookie() {
		for (var domains = window.location.hostname.split('.'); domains.length >= 2; domains.shift()) {
			var cookieString = removeCookieString('googtrans=unset', domains.join('.'));
			document.cookie=cookieString;
			if	(domains.length === 2) {
				cookieString = removeCookieString('googtrans=unset', '.'+domains.join('.'));
				document.cookie=cookieString;
			}
		}
		document.cookie=removeCookieString('googtrans=unset');
	}

	if (document.cookie.split(';').some(function(item) { return item.trim().startsWith('googtrans=/auto/en'); })) {
		unsetGoogtransCookie();
	}

	// Translate Script
	var translateURL = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
 	$.getScript(translateURL);
 	$('#translation-links a').click(function() {
 		var lang = $(this).data('lang');
 		var $frame = $('iframe.skiptranslate');

 		if (!$frame.length) {
 			return false;
 		}
 		var $el = $frame.contents().find('span.text:contains(' + lang + ')').parent().parent().get(0);

 		if (!$el) {
			$frame.contents().find('span.text:contains("English")').parent().parent().get(0);
 		}
 		$el.click();
 		return false;
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

		$('#libraries-slider').each(function(i, el) {
			var $el = $(el);
			var librariesCount = $el.children().length;
			function librariesItems(cnt) {return librariesCount > cnt ? cnt : librariesCount;}

			tns({
				container: el,
				lazyload: true,
				lazyloadSelector: '.library-banner',
				loop: false,
				gutter: 30,
				responsive: {
					0: {
						items: librariesItems(1),
					},
					768: {
						items: librariesItems(2),
					},
					992: {
						items: librariesItems(3),
					}
				}
			});
		});

		$('.freeform-books-slider').each(function(i, el) {
			tns({
				container: el,
				items: 1,
				loop: false,
				gutter: 10,
				prevButton: '.freeform-books-slider-prev',
				nextButton: '.freeform-books-slider-next',
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

	// Search
	$('.search-form select option:first').attr('value', 'catalog');
	$('.search-form select option:last').attr('value', 'website');

	$(".search-form").submit(function(e){
		var selected = $(this).find('select').val();
		var name = $(this).find('input').attr('name');
		var action;

		if (selected == 'catalog') {
			action = 'https://catalog.cmpl.org/search/';
			name = 'query';
		} else {
			action = 'search.php';
			name = 'q';
		}

		$(this).attr('action', action);
		$(this).find('input').attr('name', name);
    });

	$(".search-form select").on('change', function() {
		$('#search-input').attr('placeholder', 'Search ' + this.value  + '...');
	});

	// Left line
	if($('body').attr('id') == 'homepage'){
		function scrollLeftLine(){
			var h1 = $(window).scrollTop();
			var h2 = $('#social').position().top;
			var diff = 0;
	
			if (h1 > h2) {
				diff = h1 - h2;
				$('#complete-line').css('height', diff);
			} 
		}
		scrollLeftLine();
		window.addEventListener('scroll', scrollLeftLine);
	}

	// userway btn
	$('#app-userway-btn').on('click', function(){
		if ($window.width() < 992) {
			var e = new Event('touchstart');
			document.querySelector('.uai').dispatchEvent(e);
		} else{
			$('.uai').click();
		}
	})

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

	// Import events
	window.revizeCalendar = {
		importData: [
			{ url: false, webspace: RZ.webspace },
			{ url: '_assets_/plugins/APIGrabber/clintonlibrary.libnet.php',
			
				parser: function(data) {
					let events = [];
					data = (new window.DOMParser() ).parseFromString(data, "text/xml");
					data.querySelectorAll('item').forEach(function(node, i) {
						var event = {
							start: moment(),
							end: moment(),
							allDay: false,
							calendar_displays: ['5'],
							title: "",
							desc: "",
							location: "",
							image: '',
							rid: false,
							options: '{ "hide_end_date":true }',
						};
						event.title = node.querySelector('title').textContent;
						event.desc = node.querySelector('description').textContent;
						event.start = new Date(node.querySelector('pubDate').textContent).toISOString().slice(0, -5);

						let url = node.querySelector('link').textContent;
						if (url) {
							event.url = url;
						}

						events.push(event);
					});
					return events;
				}
			},
		]
	};

	//
	$('#nav>li:nth-of-type(4) a:first').on('click', function(){return false});

})(jQuery);