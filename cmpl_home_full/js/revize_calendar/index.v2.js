var VIEWS = {
    'month': 'dayGridMonth',
    'week': 'timeGridWeek',
    'day': 'timeGridDay',
    'list-month': 'listMonth',
    'list-week': 'listWeek',
    'list-day': 'listDay',
    'list': 'listMonth'
}

var SHORT_MONTHS =  [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC'
];

var RZ_ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

function buildRZCalendarProps() {
	var baseCalendar = {
		calendars: [],
		calendarProps: (typeof calendarProps === 'object') ? calendarProps : {},
		defaultTextColor: function(el) { return window.revizeCalendar.fns.getDefaultTextColor(el); },
		eventDisplay: 'auto',
		eventListLookBack: function(moment) { return moment.subtract(1, 'hour'); },
		eventListLookAhead: function(moment) { return moment.add(60, 'days'); },
		showLoading: (typeof calShowLoading === 'boolean') ? calShowLoading : true,
		importData: [],
		get pluginEntryPoint() { return window.revizeCalendar.fns.fullCalendarEntryPoint },
		fns: {
			full: {},
			mini: {},
			list: {},
		},
		hasDynamicSources: false,
	}
	if (typeof RZ === 'object') {
		baseCalendar.importData = [{ url: false, webspace: RZ.webspace }];
	}
	if (typeof window.revizeCalendar === 'object') {
		baseCalendar = $.extend(true, baseCalendar, window.revizeCalendar);
	}
	window.revizeCalendar = baseCalendar;
}
buildRZCalendarProps();

window.revizeCalendar_proto = { fns: { full: {}, mini: {}, list: {} } };
window.revizeCalendar_proto.fns.preInit = function() {
	if (window.revizeCalendar.showLoading) {
		$('[id^=mini-events][data-template-file], #calendar').each(function(i, el) {
			$(this).append('<div class="progress-spinner-container" style="text-align:center;padding:15px;"><span class="progress-spinner"></span></div>');
		});
	}
}

// --------------------------------------- Data Retrieval Section --------------------------------------- //

window.revizeCalendar_proto.fns.prepareImportData = async function() {
	var importData = window.revizeCalendar.importData;
	for (var i = 0; i < importData.length; i++) {
		try {
			importData[i].index = i;
			if (importData[i].url === false) {
				if (importData[i].hasOwnProperty('webspace')) {
					importData[i].url = "./_assets_/plugins/revizeCalendar/calendar_data_handler.php?webspace=" + importData[i].webspace + "&relative_revize_url=" + RZ.protocolRelativeRevizeBaseUrl + "&protocol=" + window.location.protocol;
					
					if (!importData[i].hasOwnProperty('parser')) { importData[i].parser = window.revizeCalendar.fns.defaultRevizeParser; }
					
				} else if (importData[i].hasOwnProperty('gFeed')) {
					if (!importData[i].hasOwnProperty('gKey')) { console.warn("[revizeCalendar.fns.prepareImportData] Google Feed import attempted without a key.", importData[i]); continue; }
					
					var now = moment();
					
					if (!importData[i].hasOwnProperty('spread')) { importData[i].spread = { months: 3 }; }
					if (!importData[i].hasOwnProperty('parser')) { importData[i].parser = window.revizeCalendar.fns.defaultGoogleParser; }
					if (!importData[i].hasOwnProperty('updater')) { importData[i].updater = window.revizeCalendar.fns.defaultGoogleUpdater; }
					
					window.revizeCalendar.fns.defaultGoogleQueryBuilder(importData[i], now);
					window.revizeCalendar.hasDynamicSources = true;
				}
			}
			await window.revizeCalendar.fns.getImportData(importData[i]);
		} catch (e) {
			console.warn("[revizeCalendar.fns.prepareImportData] Failed to parse import props.", importData[i], e);
		}
	}
}

window.revizeCalendar_proto.fns.getImportData = async function(source, dynamic = false) {
	if (source.hasOwnProperty("url")) {
		$.ajax(
			source.url,
			{ importParams: source })
			.fail(function(res) {
				console.warn("[revizeCalendar.fns.getImportData] Error in ajax response.", this.importParams, res);
				window.revizeCalendar.fns.updateImportData(this.importParams, res, res.status, dynamic);
			})
			.done(function(res, status, xhr) {
				window.revizeCalendar.fns.updateImportData(this.importParams, res, xhr.status, dynamic);
			});
	} else {
		window.revizeCalendar.fns.updateImportData(source, null, 200, dynamic);
	}
}

window.revizeCalendar_proto.fns.updateImportData = function(importParams, res, status, dynamic = false) {
	for (var i = 0; i < window.revizeCalendar.importData.length; i++) {
		if (importParams.index == window.revizeCalendar.importData[i].index) {
			window.revizeCalendar.importData[i].status = status;
			if (status < 400) {
				if (typeof window.revizeCalendar.importData[i].response === 'undefined') { window.revizeCalendar.importData[i].response = []; }
				window.revizeCalendar.importData[i].response = window.revizeCalendar.importData[i].response.concat(window.revizeCalendar.importData[i].parser(res));
			}
			break;
		}
	}
	if (!dynamic) { window.revizeCalendar.fns.calendarReadyCheck(); }
}

window.revizeCalendar_proto.fns.getImportedSources = function() {
	var sources = [];
	window.revizeCalendar.importData.forEach(function(source, i) {
		if (source.status < 400) {
			if (!Array.isArray(window.revizeCalendar.importData[i].response)) {
				console.warn("[revizeCalendar.fns.getImportedEvents] Import data response is not well formatted.", window.revizeCalendar.importData[i]);
				return;
			}
			sources.push({ index: i });
		}
	});
	return sources;
}

window.revizeCalendar_proto.fns.getImportedEvents = function(flatten = false) {
	var eventsArray = [];
	window.revizeCalendar.importData.forEach(function(source, i) {
		if (source.status < 400) {
			if (!Array.isArray(source.response)) {
				console.warn("[revizeCalendar.fns.getImportedEvents] Import data response is not well formatted.", source);
				return;
			}
			if (flatten) {
				eventsArray = eventsArray.concat(source.response);
			} else {
				eventsArray.push(source.response);
			}
		}
	});
	return $.extend(true, [], eventsArray);
}

window.revizeCalendar_proto.fns.calendarReadyCheck = function() {
	for (var i = 0; i < window.revizeCalendar.importData.length; i++) {
		if (!window.revizeCalendar.importData[i].hasOwnProperty('status')) { return; }
	}
	window.revizeCalendar.pluginEntryPoint();
}

window.revizeCalendar_proto.fns.defaultRevizeParser = function(data) {
	data.forEach(function(ev, i) {
		data[i].color = window.revizeCalendar.fns.getEventColor(ev);
	});
	
	return data;
}

window.revizeCalendar_proto.fns.defaultGoogleParser = function(data, calendarFilter) {
	if (!data.hasOwnProperty('items')) { return; }
	var events = [];
	data.items.forEach(function(ev, i) {
		var event = {
			allDay: false,
			calendar_displays: ['-1'],
			title: "",
			desc: "",
			location: "",
			image: "",
			start: moment(),
			gid: "",
		};
		if (ev.hasOwnProperty('start')) {
			if (ev.start.hasOwnProperty('dateTime')) {
				var t = moment(ev.start.dateTime);
				event.start = t.format(RZ_ISO_FORMAT);
			} else {
				event.allDay = true;
				var t = moment(ev.start.date);
				event.start = t.format(RZ_ISO_FORMAT);
			}
		}
		if (ev.hasOwnProperty('end') && !event.allDay) {
			var t = moment(ev.end.dateTime);
			event.end = t.format(RZ_ISO_FORMAT);
		}
		if (ev.hasOwnProperty('summary')) {
			event.title = ev.summary;
		}
		if (ev.hasOwnProperty('description')) {
			event.desc = ev.description;
		}
		if (ev.hasOwnProperty('htmlLink')) {
			event.url = ev.htmlLink;
		}
		if (ev.hasOwnProperty('location')) {
			event.location = ev.location;
		}
		if (ev.hasOwnProperty('id')) {
			event.gid = ev.id;
		}
		if (typeof calendarFilter !== 'undefined') {
			if (typeof calendarFilter === 'string' || typeof calendarFilter === 'number') {
				event.calendar_displays = [calendarFilter.toString()];
			} else if (typeof calendarFilter === 'function') {
				event.calendar_displays = [calendarFilter(ev)];
			}
		}
		events.push(event);
		
	});
	return events;
}

window.revizeCalendar_proto.fns.defaultGoogleQueryBuilder = function(source, date) {
	
	var pastDate;
	var futureDate;
	
	if (moment.isMoment(date)) {
		pastDate = date.clone().subtract(source.spread);
		futureDate = date.clone().add(source.spread);
	} else {
		pastDate = date.start;
		futureDate = date.end;
	}

	source.url = "https://www.googleapis.com/calendar/v3/calendars/"
	+ source.gFeed
	+ "/events?key="
	+ source.gKey
	+ "&timeMin=" + pastDate.format('YYYY-MM-DD') + "T00%3A00%3A00-00%3A00"
	+ "&timeMax=" + futureDate.format('YYYY-MM-DD') + "T00%3A00%3A00-04%3A00&singleEvents=true&maxResults=2500";
	
	if (typeof source.dynamicSets === 'undefined') { source.dynamicSets = []; }
	source.dynamicSets.push(
		{
			start: pastDate,
			end: futureDate,
		}
	);
}

window.revizeCalendar_proto.fns.defaultGoogleUpdater = async function(source, date) {
	window.revizeCalendar.fns.defaultGoogleQueryBuilder(source, date);
	await window.revizeCalendar.fns.getImportData(source, true);
	var UIDs = [];
	source.response = source.response.filter(function(ev) {
		if (UIDs.indexOf(ev.gid) == -1) {
			UIDs.push(ev.gid);
			return true;
		} else {
			return false;
		}
	});
}

// --------------------------------------- Calendar Plugin Section --------------------------------------- //

window.revizeCalendar_proto.fns.full.clickHandler = function(data) {
	var eInfo = {
		title: data.event.title,
		desc: data.event.extendedProps.desc,
		calendar_displays: data.event.extendedProps.calendar_displays,
		
		start: moment(data.event.start),
		end: moment(0),
		allDay: data.event.allDay,
		rrule: ((typeof data.event._def.recurringDef === 'object' && data.event._def.recurringDef !== null) ? data.event._def.recurringDef.typeData.rruleSet.toString() : false),
		
		url: data.event.url,
		location: data.event.extendedProps.location,
		image: data.event.extendedProps.image,
		
		options: data.event.extendedProps.options,
		
		rid: data.event.extendedProps.rid ?? false,
		id: data.event.id ?? false,
	};
	
	if (eInfo.allDay !== true) {
		eInfo.end = moment(data.event.end);
	}
	
	window.revizeCalendar.fns.showModal(eInfo);
}

window.revizeCalendar_proto.fns.full.eventMountHandler = function(info) {
	info.el.removeAttribute('href');
	info.el.style.borderColor = window.revizeCalendar.fns.getEventColor(info.event); // Event definition color can't be trusted
	if (info.el.classList.contains("fc-daygrid-block-event")) {
		info.el.style.backgroundColor = window.revizeCalendar.fns.getEventColor(info.event);
		info.el.classList.add(window.revizeCalendar.fns.getContrastYIQ(window.revizeCalendar.fns.getEventColor(info.event)));
	} else {
		info.el.classList.add(window.revizeCalendar.defaultTextColor(info.el));
	}
	window.revizeCalendar.fns.tagCalendarDay(info.el);
}

window.revizeCalendar_proto.fns.full.datesSetHandler = function(plugin, info) {
	window.revizeCalendar.fns.mini.datesSetHandler(plugin, info);
	
	var start = info.view.currentStart;
	var day = start.getDate().toString();
	var month = (start.getMonth() + 1 ).toString();
	var year = start.getFullYear();

	day = day.length < 2 ? '0' + day : day;
	month = month.length < 2 ? '0' + month : month;

	window.revizeCalendar.fns.changeUrlQuery([{
		prop: 'view',
		val: VIEWS[info.view.type]
	}, {
		prop: 'month',
		val: month
	}, {
		prop: 'day',
		val: day
	}, {
		prop: 'year',
		val: year
	}]);
}

window.revizeCalendar_proto.fns.full.calendarProps = function() {
	
	var oldQuery = $.query.parseNew(location.search, location.hash.split("?").length > 1 ? location.hash.split("?")[1] : "");
    if(oldQuery.get('id')){
        window.revizeCalendar.fns.changeUrlQuery('calendar');
	}
    var calendarParam = oldQuery.get('calendar').toString();
    var searchParam = oldQuery.get('query');
    var activeSearch = typeof searchParam === 'string' && searchParam.length ? searchParam : "";
    var yearParam = oldQuery.get('year').toString();
    var monthParam = oldQuery.get('month').toString();
    var dayParam = oldQuery.get('day').toString();
    var viewParam = oldQuery.get('view').toString().toLowerCase();
    var idParam = oldQuery.get('id');
    idParam = typeof idParam === 'string' && idParam.length || typeof idParam === 'number' ? idParam.toString() : '';
    var dt = new  Date();
    var filterNum = 0;


    var year = ""
    var month = "";
    var day = "";
    var defaultView = undefined;

    if(typeof viewParam === 'string' && viewParam.length){
        if(viewParam === 'day'){
            defaultView = 'timeGridDay';
        } else if(viewParam === 'week'){
            defaultView = 'timeGridWeek';
        } else if(viewParam === 'list'){
            defaultView = 'listMonth';
        } else {
            defaultView = 'dayGridMonth';
        }
    }


    // Get Year
    year = typeof yearParam === 'string' && yearParam.length === 4 ? yearParam : dt.getFullYear();

    // Get Month
    month = typeof month === 'string' && monthParam.length && month.length < 3 ? monthParam : (dt.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;

    // Get Day
    day = typeof dayParam === 'string' && dayParam.length && dayParam.length < 3 ? dayParam : (dt.getDate()).toString();
    day = day.length < 2 ? '0' + day : day;

    var defaultDate = year + '-' + month + '-' + day;

    if(activeSearch !== ""){
        $('#calendar-search').val(activeSearch);
    }

    if(calendarParam.length && $('[data-calendar-id='+calendarParam+']').length){
        activeCalendar = calendarParam;
        $('[data-calendar-id='+calendarParam+']').parent().addClass('calendar-active');
    }
	
	return {
		eventStartEditable: false,
		plugins: FullCalendar.globalPlugins,
		initialDate: defaultDate,
		initialView: defaultView,
		lazyFetching: true,
		headerToolbar: {
			left: 'prev,next,today dayGridMonth,timeGridWeek,timeGridDay,listMonth',
			center: '',
			right: 'title'
		},
		navLinks: true, // can click day/week names to navigate views
		editable: true,
		dayMaxEventRows: true,
		eventSources: [],
		eventDisplay: window.revizeCalendar.eventDisplay,
		eventDidMount: function(info) {
			window.revizeCalendar.fns.full.eventMountHandler(info);
		},
		eventClick: function(e){
			e.jsEvent.preventDefault();
			window.revizeCalendar.fns.full.clickHandler(e);
			return;
		},
		datesSet: function(info){
			window.revizeCalendar.fns.full.datesSetHandler(this, info);
		}
	};
}

window.revizeCalendar_proto.fns.mini.clickHandler = function(data) {
	window.revizeCalendar.fns.full.clickHandler(data);
}

window.revizeCalendar_proto.fns.mini.eventMountHandler = function(info) {
	window.revizeCalendar.fns.full.eventMountHandler(info);
}

window.revizeCalendar_proto.fns.mini.datesSetHandler = function(plugin, info) {
	if (window.revizeCalendar.hasDynamicSources) {
		var start = moment(info.view.currentStart);
		var end = moment(info.view.currentEnd);
		
		var fullCal = plugin;
		
		window.revizeCalendar.importData.forEach(async function(source, i) {
			if (source.hasOwnProperty('dynamicSets')) {
				var update = true;
				var closestStart = start.clone().subtract(source.spread);
				var closestEnd = start.clone().add(source.spread);
				
				source.dynamicSets.forEach(function(set) {
					if (start.isAfter(set.start) && end.isBefore(set.end)) {
						update = false;
						return;
					} else {
						if (closestStart.isBetween(set.start, set.end) && closestEnd.isAfter(set.end)) {
							closestStart = moment.min(closestStart, set.end);
						}
						if (closestStart.isBefore(set.start) && closestEnd.isBetween(set.start, set.end)) {
							closestEnd = moment.max(closestEnd, set.start);
						}
					}
				});
				if (update && closestEnd.isAfter(closestStart)) {
					await source.updater(source, { start: closestStart, end: closestEnd });
					fullCal.refetchEvents();
				}
			}
		});					
	}
}

window.revizeCalendar_proto.fns.mini.calendarProps = function() {
	return {
		eventStartEditable: false,
		height: 'auto',
		plugins: FullCalendar.globalPlugins,
		headerToolbar: {
			left: 'prev,next today',
			center: '',
			right: 'title'
		},
		navLinks: true, // can click day/week names to navigate views
		editable: false,
		initialView: 'dayGridMonth',
		eventSources: [],
		eventDisplay: window.revizeCalendar.eventDisplay,
		eventDidMount: function(info) {
			window.revizeCalendar.fns.mini.eventMountHandler(info);
		},
		eventClick: function(e){
			e.jsEvent.preventDefault();
			window.revizeCalendar.fns.mini.clickHandler(e);
			return;
		},
		datesSet: function(info){
			window.revizeCalendar.fns.mini.datesSetHandler(this, info);
		}
	};
}

window.revizeCalendar_proto.fns.full.eventsFilter = function(eventSource) {
	
	var activeCalendar = $.query.get('calendar').toString();
	var activeSearch = $.query.get('query').toString().toLowerCase();
	
	function filterSource(source) {
		return source.filter(function(ev) {
			if (activeCalendar !== "" && ev.calendar_displays.indexOf(activeCalendar) === -1) {
				return false;
			}
			if (activeSearch !== "" && ev.title.toLowerCase().indexOf(activeSearch) === -1) {
				return false;
			}
			if (!ev.hasOwnProperty('calendar_displays') || ev.calendar_displays.length === 0) {
				console.warn("[revizeCalendar.fns.full.eventsFilter] Event does not have an assigned calendar.", ev);
				return true;
			}
			for (var i = 0; i < ev.calendar_displays.length; i++) {
				if (ACTIVE_CALENDAR_IDS.indexOf('|'+ev.calendar_displays[i]+'|') >= 0) {
					return true;
				}
			}
			
			return false;
		});
	}
	
	if (Array.isArray(eventSource[0])) {
		eventSource.forEach(function(es, i) {
			eventSource[i] = filterSource(es);
		});
	} else {
		eventSource = filterSource(eventSource);
	}
	return eventSource;
}

window.revizeCalendar_proto.fns.mini.eventsFilter = function(eventSource, el) {
	if (!eventSource.length) { return eventSource; }
	var activeMiniCalendars = el.dataset.hasOwnProperty('calendar') ? el.dataset['calendar'].split(",") : [];
	
	var includeAll = true;
	var includeList = [];
	var ignoreList = []; // Exclude event if is primary calendar
	var excludeList = []; // Exclude event if on ANY of these calendars
	for (var c = 0; c < activeMiniCalendars.length; c++) {
		var cID = parseInt(activeMiniCalendars[c]);
		if (isNaN(cID)) {
			excludeList.push(parseInt(activeMiniCalendars[c].replace(/[^0-9]/g, "")));
		} else if (cID < 0) {
			ignoreList.push(cID * -1);
		} else {
			includeList.push(cID);
			includeAll = false;
		}
	}
	
	function filterSource(source) {
		return source.filter(function(ev) {
			if (typeof ev !== 'object' || !ev.hasOwnProperty('calendar_displays') || ev.calendar_displays.length === 0) {
				console.warn("[revizeCalendar.fns.mini.eventsFilter] Event does not have an assigned calendar.", ev, source);
				return false;
			}
			var includeFlag = includeAll;
			for (var i = 0; i < ev.calendar_displays.length; i++) {
				var cID = parseInt(ev.calendar_displays[i]);
				if (i == 0) {
					if (ignoreList.indexOf(cID) > -1) {
						return false;
					}
				}
				
				if (includeList.indexOf(cID) > -1) {
					includeFlag = true;
				}
				
				if (excludeList.indexOf(cID) > -1) {
					return false;
				}
			}
			return includeFlag;
		});
	}
	
	if (Array.isArray(eventSource[0])) {
		eventSource.forEach(function(es) {
			es = filterSource(es);
		});
	} else {
		eventSource = filterSource(eventSource);
	}
	
	return eventSource;
}

window.revizeCalendar_proto.fns.list.eventsFilter = function(events, el) {
	events = window.revizeCalendar.fns.mini.eventsFilter(events, el);
	
	var rruledEvents = events.filter(function(ev) {
		if (ev.hasOwnProperty('rrule')) {
			return true;
		}
		return false;
	});
	
	var now = moment().toDate();
	var lookAhead = window.revizeCalendar.eventListLookAhead(moment()).toDate();
	
	try {
		rruledEvents.forEach(function(ev, ei) {
			var rule = new rrule.rrulestr(ev.rrule, { forceset: true });
			
			var dstart = moment(ev.start);
			var dend = (ev.hasOwnProperty('end') ? moment(ev.end) : undefined);
			
			var dur = undefined;
			if (dend) {
				dur = moment.duration(dend.diff(dstart));
			}
			
			var occurences = rule.between(dstart.toDate(), lookAhead, false);
			occurences.forEach(function(oc, oi) {
				var recurredEvent = $.extend({}, ev);
				oc = oc.setMinutes(oc.getMinutes() + oc.getTimezoneOffset()); // RRule library recognizes that browser Date sucks and suggests doing this.
				var rstart = moment(oc);
				rstart.set({ hours: dstart.hours(), minutes: dstart.minutes(), seconds: dstart.seconds});
				var rend = dend;
				if (rend) {
					rend = moment(rstart);
					rend.add(dur);
				}
				
				recurredEvent.start = rstart;
				recurredEvent.end = rend;
				
				events.push(recurredEvent);
			});
		});
	} catch (e) {
		console.warn("[revizeCalendar.fns.mini.eventsFilter] RRule expansion has encountered an error", e);
	}
	
	var thisMorning = moment().startOf('day');
	var todayLookBack = moment();
	if (window.revizeCalendar.eventListLookBack == 'morning') {
		todayLookBack = todayLookBack.startOf('day');
	} else if (typeof window.revizeCalendar.eventListLookBack == 'function') {
		try {
			todayLookBack = window.revizeCalendar.eventListLookBack(todayLookBack);
		} catch (e) {
			console.warn("[revizeCalendar.fns.mini.eventsFilter] Supplied Look Back function encountered an error", e);
		}
	}
	events = events.filter(function(ev) {
		if (typeof ev.start === 'string' && ev.start.length > 0) { ev.start = moment(ev.start); }
		if (typeof ev.end === 'string' && ev.end.length > 0) { ev.end = moment(ev.end); }
		if (ev.allDay) {
			if (ev.end !== undefined) {
				if (moment(ev.end).isSameOrAfter(thisMorning)) { return true; }
			} else {
				if (moment(ev.start).isSameOrAfter(thisMorning)) { return true; }
			}
		} else {
			if (moment(ev.end).isSameOrAfter(todayLookBack)) { return true; }
		}
		return false
	})
	events = events.sort(function(a, b) { return a.start.valueOf() - b.start.valueOf(); });
		
	return events;
}

window.revizeCalendar_proto.fns.full.build = function() {
	$("#calendar").each(function(i, el) {
		var fCalendarProps = window.revizeCalendar.fns.full.calendarProps();
		
		var eventSources = window.revizeCalendar.fns.getImportedSources();
		eventSources.forEach(function(source) {
			source.events = function(info, succ, fail, a) {
				var evs = window.revizeCalendar.fns.full.eventsFilter(
					window.revizeCalendar.importData[source.index].response
				);
				succ(evs);
			}
		});
		
		fCalendarProps.eventSources = eventSources;
		
		var calendar = new FullCalendar.Calendar(el, fCalendarProps);
		calendar.render();
		
		window.revizeCalendar.calendars.push(calendar);
		el.classList.add("fc-" + FullCalendar.version.replaceAll(".", "-"));
		window.revizeCalendar.fns.full.postRender(el, calendar);
	});
}

window.revizeCalendar_proto.fns.mini.build = function() {
	var mCalendarProps = window.revizeCalendar.fns.mini.calendarProps();
	$("[id^=mini-events][data-template-file]").each(function(i, el) {
		
		if (el.dataset.hasOwnProperty('templateFile')) {
			$.ajax('./_assets_/plugins/revizeCalendar/templates/'+el.dataset['templateFile'])
				.fail(function() {
					console.warn("[revizeCalendar.fns.mini.calendarProps] Failed to get template for mini calendar.", el);
				}).done(function(data) { 
					$(el).html(data);
					
					$(el).find(".mini-calendar").each(function(ci, cal) {
						var eventSources = window.revizeCalendar.fns.getImportedSources();
						eventSources.forEach(function(source) {
							source.events = function(info, succ, fail, a) {
								var evs = window.revizeCalendar.fns.mini.eventsFilter(
									window.revizeCalendar.importData[source.index].response,
									cal
								);
								succ(evs);
							}
						});
		
						var calendarView = (cal.dataset.hasOwnProperty('calendarView') ? cal.dataset['calendarView'] : 'month');
						if(VIEWS.hasOwnProperty(calendarView)){
							calendarView = VIEWS[calendarView];
						} else {
							calendarView = VIEWS['month'];
						}
						
						mCalendarProps.initialView = calendarView;
						
						var foundViewButton = false;
						for (key in mCalendarProps.headerToolbar) {
							if (mCalendarProps.headerToolbar[key].indexOf(calendarView) >= 0) {
								foundViewButton = true;
							}
						}
						if (!foundViewButton) {
							mCalendarProps.headerToolbar.left = mCalendarProps.headerToolbar.left + " " + calendarView;
						}
						
						mCalendarProps.eventSources = eventSources;
						
						var calendar = new FullCalendar.Calendar(cal, mCalendarProps);
						calendar.render();
						
						window.revizeCalendar.calendars.push(calendar);
						cal.classList.add("fc-" + FullCalendar.version.replaceAll(".", "-"));
						window.revizeCalendar.fns.mini.postRender(cal, calendar);
						
					});
					$(el).find(".mini-events-list").each(function(ei, list) {
						var jsonEvents = window.revizeCalendar.fns.getImportedEvents(true);
						
						var listLen = list.dataset.hasOwnProperty('listLength') ? parseInt(list.dataset['listLength']) : 3;
						var descLimit = list.dataset.hasOwnProperty('characterLimit') ? parseInt(list.dataset['characterLimit']) : 120;
						var eventSources = window.revizeCalendar.fns.list.eventsFilter(jsonEvents, list)
							.slice(0, listLen);

						$(list).html(window.revizeCalendar.fns.list.dottedTemplate(list, eventSources, { descLimit: descLimit } ));
					});
				});
		}
	});
}

window.revizeCalendar_proto.fns.refreshCalendars = function() {
	window.revizeCalendar.calendars.forEach(function(cal) {
		cal.getEventSources().forEach(function(source) {
			source.refetch();
		});
	});
}

window.revizeCalendar_proto.fns.full.postRender = function(el, calendar) {
	var exportButton = document.createElement("button");
	exportButton.id = "ics-view-export";
	exportButton.className = "btn btn-primary";
	exportButton.innerText = "Export Calendar";
	exportButton.addEventListener("click", function() {
		window.revizeCalendar.fns.exportCalendar(calendar);
	});
	
	el.append(exportButton);
	
}
window.revizeCalendar_proto.fns.mini.postRender = function(el, calendar) {}
window.revizeCalendar_proto.fns.list.postRender = function(el) {}

window.revizeCalendar_proto.fns.list.dottedTemplate = function(el, eventSources, options = {}) {
	options = $.extend({ descLimit: 120 }, options);
	var template = doT.template(el.innerHTML);
	$(el).html(
		template(eventSources.map(function(ev, ei) {
			var evStart = ev.start;
			var evEnd = ev.end;
			var desc = '';
			var calendarName = ev.primary_calendar_name;
			calendarName = calendarName == 'undefined' || calendarName === '' || calendarName === ' ' ? false : calendarName;
			var location = ev.location;
			
			// Parse Description
			desc = window.revizeCalendar.fns.decodeEventDescription(ev.desc, ev);
			
			var strippedDesc = desc.replace(/<\/?br ?\/?>/gi,"&lt;br&gt;").replace(/(<([^>]+)>)/gi," ").replace(/\s\s/gi," ").replace(/&lt;br&gt;/gi,"<br>").replace(/href=\"\.\.\//g,"href=\"");
			if (strippedDesc.length > options.descLimit) {
				var nextBreak = strippedDesc.indexOf(" ", options.descLimit);
				if (nextBreak > -1) {
					strippedDesc = strippedDesc.substr(0, nextBreak) + "...";
				}
			}
			
			var evImage = "";
			if (ev.hasOwnProperty("image") && ev.image.indexOf('noimage.gif') < 0) {
				evImage = decodeURIComponent(ev.image);
			}

			var templateEvent = {
				extended: ev,
				title: ev.title,
				desc: strippedDesc,
				image: evImage,
				color: window.revizeCalendar.fns.getEventColor(ev),
				loaded: 'mini-list-loaded',
				i: ei,
				calendar_name: calendarName,
				location: location,
				start: {
					date: evStart,
					month:{
						num: evStart.format('M'),
						numPadded: evStart.format('MM'),
						ord: evStart.format('Mo'),
						short: evStart.format('MMM'),
						long: evStart.format('MMMM')
					},
					day: {
						num: evStart.format('D'),
						ord: evStart.format('Do'),
						numPadded: evStart.format('DD')
					},
					year: {
						short: evStart.format('YY'),
						long: evStart.format('YYYY')
					}
				},
				end: {
					date: undefined,
					hidden: ev.hide_end_date === 'true' || (typeof ev.options === "string" && ev.options.indexOf("\"hide_end_date\":true") >= 0),
				}
			};
			
			if (ev.allDay !== true) {
				templateEvent.end = {
					date: evEnd,
					hidden: ev.hide_end_date === 'true' || (typeof ev.options === "string" && ev.options.indexOf("\"hide_end_date\":true") >= 0),
					month:{
						num: evEnd.format('M'),
						numPadded: evEnd.format('MM'),
						ord: evEnd.format('Mo'),
						short: evEnd.format('MMM'),
						long: evEnd.format('MMMM')
					},
					day: {
						num: evEnd.format('D'),
						ord: evEnd.format('Do'),
						numPadded: evEnd.format('DD')
					},
					year: {
						short: evEnd.format('YY'),
						long: evEnd.format('YYYY')
					}
				};
			}

			return templateEvent;
		}))
    );
	window.revizeCalendar.fns.list.postRender(el);
	$(el).find('[data-click-event][data-index]').each(function(i, eventElem) {
		var eventIndex = parseInt(eventElem.dataset['index']);
		if (isNaN(eventIndex)) {
			console.warn("[revizeCalendar.fns.list.dottedTemplate] Event did not have a proper index attribute", eventElem);
			return; 
		}
		$(eventElem).on('click', function(e) { e.preventDefault(); (function(eventData) { window.revizeCalendar.fns.showModal(eventData); }).bind(null, eventSources[eventIndex])(); return false; });
	});
	
	$(el).find(".progress-spinner-container").remove();
	$(el).addClass('mini-list-loaded');
	if( typeof RZRenderMini !== 'undefined' ){
		RZRenderMini(el);
	}
	
}

window.revizeCalendar_proto.fns.fullCalendarEntryPoint = function() {
	window.revizeCalendar_proto.fns.full.build();
	window.revizeCalendar_proto.fns.mini.build();
	window.revizeCalendar_proto.fns.buildModal();
	window.revizeCalendar_proto.fns.urlQueryModal();
}

// --------------------------------------- Modal Section --------------------------------------- //

window.revizeCalendar_proto.fns.resetModal = function(eInfo) {
	$('#event-modal #ics-export').remove();
	$('#event-modal #modal-event-duration').remove();
	$('#event-modal .modal-footer').prepend('<button onclick="javascript:icalExport.download(\''+eInfo.title+'\');return false;" id="ics-export" class="btn btn-primary">ICS</button>');
	$('#event-modal .event-modal-header').css('background','none');
	$('#event-modal .modal-event-date-wrap').css('background-color', window.revizeCalendar.fns.getEventColor(eInfo));
	$('#event-edit, #event-delete').remove();
	$('#event-modal .modal-footer .btn').css('background-color', window.revizeCalendar.fns.getEventColor(eInfo));
	$('#modal-event-location').html('');
}

window.revizeCalendar_proto.fns.buildModal = function() {
	if (document.querySelectorAll("#event-modal").length < 1) {
		var modal = document.createElement("div");
		modal.className = "modal fade";
		modal.id = "event-modal";
		modal.tabIndex = "-1";
		modal.setAttribute("role", "dialog");
		modal.setAttribute("aria-labelledby", "modal-event-title");
		modal.setAttribute("aria-hidden", "true");
		
		modal.innerHTML = '<div id="event-modal-dialog" class="modal-dialog modal-dialog-centered" role="document"> <div class="modal-content"> <div class="event-modal-header"> <div class="modal-event-date-wrap"> <span class="modal-event-date-number"></span> <span class="modal-event-date-month"></span> </div> </div> <div class="modal-body" id="modal-event-body"> <h2 class="modal-title" id="modal-event-title"></h2> <h3 class="modal-subtitle" id="modal-event-subtitle"></h3> <div class="modal-description clearfix" id="modal-event-description"></div> <div class="modal-location" id="modal-event-location"></div> </div> <div class="modal-footer"> <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> <a href="#" id="modal-event-readmore" class="btn btn-primary">Read More</a> </div> </div> </div>';
		
		document.body.appendChild(modal);
	}
}

window.revizeCalendar_proto.fns.createModalHeader = function(eInfo) {
	if (eInfo.image !== '') {
		var $img = $(decodeURIComponent(eInfo.image));
		var src = $img.attr('src');
		if (!src || src.indexOf("noimage.gif") >= 0 || src.indexOf("/revize/plugins/") >= 0) {
			eInfo.image = "./_assets_/plugins/revizeCalendar/images/default-event.jpg";
		} else {
			eInfo.image = src;
		}
	}
	if (eInfo.image === '') {
		eInfo.image = "./_assets_/plugins/revizeCalendar/images/default-event.jpg";
	}

	if(eInfo.location !== '' && eInfo.location !== 'none'){
		$('#modal-event-location').html('<iframe class="rz-business-inner-map" height="175" frameborder="0" style="width:100%;margin:10px 0;border:1px solid '+window.revizeCalendar.fns.getEventColor(eInfo)+'" src=https://www.google.com/maps/embed/v1/place?key=AIzaSyAOLPINIt8gtJpi00yqu4vHL9Ye6hhKDYI&amp;q="'+encodeURIComponent(eInfo.location)+'" allowfullscreen="true"></iframe>')
	}
	
	var eventTimes = "";
	if (eInfo.allDay) {
		if (eInfo.end.isAfter(eInfo.start, 'day')) {
			eventTimes = '<span class="dur-start">' + eInfo.start.format('MMM Do ') + '</span> '
			eventTimes += '- <span class="dur-end">' + eInfo.end.format('MMM Do ') + '</span>';
		} else {
			eventTimes = "All Day";
		}
	} else {
		eventTimes = '<span class="dur-start">' + eInfo.start.format('hh:mm A') + '</span> ';
		if (typeof eInfo.options === "string" && eInfo.options.indexOf("\"hide_end_date\":true") === -1) {
			var endString = eInfo.end.format('hh:mm A');
			if (eInfo.end.isAfter(eInfo.start, 'year')) {
				endString = eInfo.end.format(', YYYY ') + endString;
			}
			if (eInfo.end.isAfter(eInfo.start, 'day')) {
				endString = eInfo.end.format('MMM Do ') + endString;
			}
			eventTimes += '- <span class="dur-end">' + endString + '</span>';
		}
	}
	
	$('#event-modal .event-modal-header').css('background', "url('" + eInfo.image + "') center center / cover no-repeat");
	$('#event-modal .event-modal-header').append('<div style="background-color:'+ window.revizeCalendar.fns.getEventColor(eInfo)+'" id="modal-event-duration">'
		+ '<h3>'+eventTimes+'</h3>'
		+ '</div>');

	var monthDate = eInfo.start.date();
	if (monthDate.toString().length < 2) { monthDate = "0" + monthDate; }

	$('#event-modal .modal-event-date-number').text(monthDate);
	$('#event-modal .modal-event-date-month').text(SHORT_MONTHS[eInfo.start.month()]);
}

window.revizeCalendar_proto.fns.createModalBody = function(eInfo) {
	$('#modal-event-title').text(eInfo.title);
	$('#modal-event-description').html(eInfo.desc.replace(/href=\"\.\.\//g,"href=\""));
}

window.revizeCalendar_proto.fns.createModalFooter = function(eInfo) {
	if(eInfo.url.length){
		$('#modal-event-readmore').attr('href', eInfo.url).show();
	} else {
		$('#modal-event-readmore').hide();
	}
	
	if(typeof RZ !== 'undefined' && RZ.login && eInfo.edit && typeof eInfo.rid === "string" && eInfo.rid.indexOf("RevizeCalendar") < 0) {
		var flag = true;
		if ((!/\bsuperuser\b/.test(RZ.roles) && !/\badministrator\b/.test(RZ.roles)) && calendarProps.hasOwnProperty(eInfo.calendar_displays[0])) {
			var prop = calendarProps[eInfo.calendar_displays[0]];
			if (prop.hasOwnProperty("permissions")) {
				if (prop['permissions'].indexOf(RZ.hashed_username) === -1) {
					flag = false;
				}
			}
		}
		if (flag) {
			$('#event-modal .modal-footer').prepend('<a id="event-edit" href="'+eInfo.edit+'" class="btn btn-secondary">Edit Event</a>');
			$('#event-modal .modal-footer').prepend('<a id="event-delete" class="btn btn-danger" href="javascript:RZdelete( \''+eInfo.rid+'\', \'rzevents\' );">Delete</a>');
		}
	}
}

window.revizeCalendar_proto.fns.createModalExport = function(eInfo) {
	var icsStart = eInfo.start;
	var icsEnd = moment(icsStart).add(1, 'day');
	if (!eInfo.allDay) {
		icsEnd = eInfo.end;
	}
	
	if (eInfo.allDay) {
		icsStart = icsStart.format('YYYY-MM-DD') + 'T00:00:00'
		icsEnd = icsEnd.format('YYYY-MM-DD') + 'T00:00:00'
	} else {
		icsStart = icsStart.toISOString();
		icsEnd = icsEnd.toISOString();
	}
	
	var sanitizeDesc = eInfo.desc.replace(/(<([^>]+)>)/ig,"").replace("\n","");
	
	icalExport = ics();
	/*if(eInfo.rrule !== false){
		var tempRule = {};
		tempRule.rrule = eInfo.rrule;
		tempRule.rrule = tempRule.rrule.split('\n').filter(function(rule){
			return rule.indexOf('RRULE:') >= 0;
		}).join('\n');
		
		//var UTCShift = new Date(icsStart);
		//UTCShift.setMinutes( UTCShift.getMinutes() + UTCShift.getTimezoneOffset() );
		
		icalExport.addEvent(eInfo.title, sanitizeDesc, eInfo.location, icsStart, icsEnd, tempRule);
	} else {*/
		icalExport.addEvent(eInfo.title, sanitizeDesc, eInfo.location, icsStart, icsEnd);
	//}
}

window.revizeCalendar_proto.fns.showModal = function(event){
	var eInfo = {
		title: '',
		desc: '',
		calendar_displays: [0],
		
		start: moment(0),
		end: moment(0),
		rrule: false,
		
		url: '',
		location: '',
		image: '',
		
		options: '',
		
		edit: '',
		rid: false,
		id: false,
	};
	
	eInfo = $.extend(eInfo, event);
	// Parse Description
	eInfo.desc = window.revizeCalendar.fns.decodeEventDescription(eInfo.desc, eInfo);
	
	if (eInfo.rid) {
		var selectedDate = eInfo.start;
		var dateStr = eInfo.start.format().slice(0,-1).replace(/[-:\.]/g,'').slice(0,-3); //new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().slice(0,-1).replace(/[-:\.]/g,'').slice(0,-3);
		eInfo.edit = 'javascript:RZedit(\''+eInfo.rid+'\',\'\/revize\/plugins\/revize_calendar/editforms\/calendar_events-editform.jsp?selected_date='+dateStr+'\',\'0\',\'0\',\'\',\'\',\'rzevents\',\'\',\'\',\'editform\',\'*none*\',\'\',\'\')';
	}
	
	window.revizeCalendar.fns.resetModal(eInfo);
	
	window.revizeCalendar.fns.createModalHeader(eInfo);
	window.revizeCalendar.fns.createModalBody(eInfo);
	window.revizeCalendar.fns.createModalFooter(eInfo);

	window.revizeCalendar.fns.createModalExport(eInfo);

	if (eInfo.id !== false) {
		var queryParam = eInfo.id;
		if (eInfo.rrule !== false) {
			queryParam += "+" + eInfo.start.format(RZ_ISO_FORMAT);
		}
		window.revizeCalendar.fns.changeUrlQuery([{ prop: 'event', val: queryParam }]);
	}

	$('#event-modal').modal('show');
}

window.revizeCalendar_proto.fns.urlQueryModal = function() {
	var q = $.query.parseNew(location.search, location.hash.split("?").length > 1 ? location.hash.split("?")[1] : "");
	var evId = q.get('event').toString();
	if (evId == "") { return; }
	
	var evParams = evId.split("+");
	var event = null;
	
	for (var i = 0; i < window.revizeCalendar.importData.length; i++) {
		if (event !== null) { break; }
		if (!window.revizeCalendar.importData[i].hasOwnProperty("response")) { continue; }
		
		for (var e = 0; e < window.revizeCalendar.importData[i].response.length; e++) {
			if (window.revizeCalendar.importData[i].response[e].id == evParams[0]) { event = window.revizeCalendar.importData[i].response[e]; break; }
		}
	}
	
	if (event === null) { return; }
	
	var eInfo = {
		title: event.title,
		desc: event.desc,
		calendar_displays: event.calendar_displays,
		
		start: moment(event.start),
		end: moment(0),
		allDay: event.allDay,
		rrule: event.rrule ?? false,
		
		url: event.url,
		location: event.location,
		image: event.image,
		
		options: event.options,
		
		rid: event.rid,
		id: event.id,
	};
	
	if (eInfo.allDay !== true) {
		eInfo.end = moment(event.end);
	}
	
	if (evParams.length == 2) {
		// Recurring Event
		if (!event.hasOwnProperty("rrule") || event.rrule == "") { return; }
		
		var foundOccurence = false;
		var specificDate = moment(decodeURIComponent(evParams[1]));
		if (!specificDate.isValid()) { return; }
		
		var rule = new rrule.rrulestr(event.rrule, { forceset: true });
		
		var dstart = moment(event.start);
		var dend = (event.hasOwnProperty('end') ? moment(event.end) : undefined);
		
		var dur = undefined;
		if (dend) {
			dur = moment.duration(dend.diff(dstart));
		}
		
		var lookAhead = moment(specificDate).add('1 day').toDate();
		
		var occurences = rule.between(dstart.toDate(), lookAhead, false);
		for (var i = 0; i < occurences.length; i++) {
			occurences[i] = occurences[i].setMinutes(occurences[i].getMinutes() + occurences[i].getTimezoneOffset());
			var rstart = moment(occurences[i]);
			
			if (!specificDate.isSame(rstart)) { continue; }
			
			var rend = dend;
			if (rend) {
				rend = moment(rstart);
				rend.add(dur);
			}
			
			eInfo.start = rstart;
			eInfo.end = rend;
			
			foundOccurence = true;
		}
		
		if (!foundOccurence) { return; }
	}
	window.revizeCalendar.fns.showModal(eInfo);
}

// --------------------------------------- Helpers Section --------------------------------------- //

window.revizeCalendar_proto.fns.exportCalendar = function(cal) {
	if (!cal) { return; }
	
	var fullEvents = cal.getEvents();
	icalExport = ics();
	window.revizeCalendar.fns.addEventsToExport(fullEvents, icalExport);
	
	var exportName = "Full Calendar";
	
	var activeCalendar = $.query.get('calendar').toString();
	if (activeCalendar !== "") {
		exportName = $(".calendar-name-filter[data-calendar-id="+activeCalendar+"]").text();
	}
	
	icalExport.download(exportName);
}

window.revizeCalendar_proto.fns.addEventsToExport = function(events, ical) {
	$.each(events, function(i, ev){
		
		try {
			decodeURIComponent(ev.desc);
		} catch (e) {
			console.warn("[addEventsToExport] Could not add event " + ev.id + " to the export as the description is malformed.");
			return;
		}

		var startStr = "";
		var endStr = "";
		var locationStr = "";
		var descStr = "";
		
		if (ev._def.extendedProps.hasOwnProperty("desc")) {
			try {
				descStr = decodeURIComponent(ev._def.extendedProps.desc);
			} catch (e) {}
		}
		
		if (ev._def.extendedProps.hasOwnProperty("location")) {
			locationStr = ev._def.extendedProps.location;
		}
		
		if (ev.allDay) {
			startStr = moment(ev.start).startOf('day').toISOString();
			endStr = startStr;
		} else {
			var startM = moment(ev.start);
			var endM = moment(ev.end);

			if (startM.isSame(endM)) {
				startStr = moment(ev.start).toISOString();
				endStr = moment(ev.end).add(1, 'second').toISOString();
			} else {
				startStr = moment(ev.start).toISOString();
				endStr = moment(ev.end).toISOString();
			}
		}

		/*if (ev._def.extendedProps.hasOwnProperty("rrule")) {
			var tempRule = {};
			tempRule.rrule = ev.rrule;

			if(tempRule.rrule.indexOf('DTSTART') >= 0 ){
				tempRule.rrule = tempRule.rrule.split('\n').filter(function(dt){
					return dt.indexOf('DTSTART') < 0;
				}).join('\n');
			}

			if(tempRule.rrule.indexOf('RDATE') >= 0 ){
				tempRule.rrule = tempRule.rrule.split('\n').filter(function(dt){
					return dt.indexOf('RDATE') < 0;
				}).join('\n');
			}
			
			ical.addEvent(ev.title, descStr, locationStr, startStr, endStr, tempRule); 
		} else {*/
			ical.addEvent(ev.title, descStr, locationStr, startStr, endStr, null);
		//}
	});
}

window.revizeCalendar_proto.fns.getEventColor = function(event) {
	var color = defaultCalendarColor; // var color = event.backgroundColor;
	var ind;

	if (event.extendedProps) {
		ind = event.extendedProps.calendar_displays[0];
	} else {
		ind = event.calendar_displays[0];
	}
	if (window.revizeCalendar.calendarProps[ind]) {
		color = window.revizeCalendar.calendarProps[ind].color;
	}

	return color;
}

window.revizeCalendar_proto.fns.getContrastYIQ = function(color){
	
	var r, g, b;
	var a = 1;
	
	if (color.indexOf("#") !== -1 && color.length === 7) {
		color = color.replace("#", "");
		r = parseInt(color.substr(0,2),16);
		g = parseInt(color.substr(2,2),16);
		b = parseInt(color.substr(4,2),16);
	} else if (color.indexOf("rgb") !== -1) {
		color = color.split(/[()]/);
		if (color.length == 3) {
			color = color[1].split(",");
			r = parseInt(color[0].trim());
			g = parseInt(color[1].trim());
			b = parseInt(color[2].trim());
			if (color.length > 3) {
				a = parseFloat(color[3].trim());
			}
		}
	}
	
	if (r !== undefined && g !== undefined && b !== undefined) {
		var yiq = (((r*299)+(g*587)+(b*114))/a)/1000;
		return (yiq >= 150) ? 'dark-text' : 'light-text';
	}
	
	return 'dark-text';
}

window.revizeCalendar_proto.fns.tagCalendarDay = function(el) {
	var par = el.parentElement;
	while (par !== null && par.tagName !== 'TABLE') {
		par = par.parentElement;
		if (par === null || par.tagName === 'TABLE') { break; }
		if (par.classList.contains("fc-daygrid-day")) {
			par.classList.add("day-has-event");
			return;
		}
	}
}

window.revizeCalendar_proto.fns.tagCalendarDays = function(cal) {
	cal.querySelectorAll(".fc-daygrid-event").forEach(function(el, i) {
		el.classList.remove("day-has-event");
	});
	cal.querySelectorAll(".fc-daygrid-event").forEach(function(el, i) {
		window.revizeCalendar.fns.tagCalendarDay(el);
	});
}

window.revizeCalendar_proto.fns.changeUrlQuery = function(args) {
	var q = $.query.parseNew(location.search, location.hash.split("?").length > 1 ? location.hash.split("?")[1] : "");

	var url = window.location.href.split('?').shift();
	var s;
	if (arguments.length){
		if (Array.isArray(args)){
			for (var i = 0; i < args.length; i++){
				if (args[i].prop)
				q = q.SET(args[i].prop, args[i].val);
			}
		} else if(typeof args === 'string'){
			q = q.REMOVE(args);
		}
	}
	s = q.toString();

	window.history.replaceState(q, 'Calendar', url + s);
}

window.revizeCalendar_proto.fns.getDefaultTextColor = function(cal) {
	var el = cal;
	while (el !== null) {
		if (window.getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)') {
			return window.revizeCalendar.fns.getContrastYIQ(window.getComputedStyle(el).backgroundColor);
		}
		el = el.parentElement;
	}
	return "";
}

window.revizeCalendar_proto.fns.decodeEventDescription = function(string, ev) {
	try {
		var base64 = false;
		if (/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(string)) {
			var rzEncodedPrefix = "[RZ:base64]";
			var decoded = atob(string);
			if (decoded.indexOf(rzEncodedPrefix) === 0) {
				string = decoded.substr(rzEncodedPrefix.length);
				base64 = true;
			}
		}
		if (!base64) {
			string = decodeURIComponent(string);
		}
	} catch (e){
		string = unescape(string);
		console.warn("[revizeCalendar.fns.list.dottedTemplate] Garbage Characters detected in event", ev);
	}
	return string;
}

window.revizeCalendar.fns.__proto__ = window.revizeCalendar_proto.fns;
window.revizeCalendar.fns.full.__proto__ = window.revizeCalendar_proto.fns.full;
window.revizeCalendar.fns.mini.__proto__ = window.revizeCalendar_proto.fns.mini;
window.revizeCalendar.fns.list.__proto__ = window.revizeCalendar_proto.fns.list;

// --------------------------------------- Main Calendar Filter Section --------------------------------------- //

setTimeout(function() {

	$('.calendar-name-filter, .calendar-tab-filter').off('click');
	$('.calendar-name-filter, .calendar-tab-filter').on('click', function(e){
		e.preventDefault();
		if ($(this).data('calendar-id').toString() === "clear") {
			$('.calendar-active').removeClass('calendar-active');
			
			window.revizeCalendar.fns.changeUrlQuery("calendar");
		} else {
			if(!$(this).parent().hasClass('calendar-active')){
				$('.calendar-active').removeClass('calendar-active');
				$(this).parent().addClass('calendar-active');

				window.revizeCalendar.fns.changeUrlQuery([{
					prop: 'calendar',
					val: $(this).data('calendar-id').toString()
				}]);
			} else {
				$('.calendar-active').removeClass('calendar-active');
				
				window.revizeCalendar.fns.changeUrlQuery('calendar');
			}
		}
		window.revizeCalendar.fns.refreshCalendars();
	});

	$('#calendar-search').off('keyup');
	$('#calendar-search').on('keyup', function(e) {
		if (e.which === 13) {
			window.revizeCalendar.fns.submitSearch($(this).val());
		}
	});

	$('#calendar-submit').off('click');
	$('#calendar-submit').on('click',function(e) {
		e.preventDefault();
		window.revizeCalendar.fns.submitSearch($('#calendar-search').val());
	});

	$('#event-modal').off('hidden.bs.modal');
	$('#event-modal').on('hidden.bs.modal', function() {
		window.revizeCalendar.fns.changeUrlQuery('event','');
	});

}, 1000);

window.revizeCalendar.fns.submitSearch = function(searchStr) {
	if (searchStr.trim().length > 0) {
		window.revizeCalendar.fns.changeUrlQuery([{
			prop: 'query',
			val: searchStr.toLowerCase()
		}]);
	} else {
		window.revizeCalendar.fns.changeUrlQuery('query');
	}
	window.revizeCalendar.fns.refreshCalendars();
}

// --------------------------------------- Init --------------------------------------- //

async function scriptToPromise(url, base = "") {
	return new Promise(function(resolve, reject) {
		var scriptTag = document.createElement("script");
		scriptTag.async = false;
		scriptTag.src = base + url;
		scriptTag.onload = function() { resolve(); };
		scriptTag.onerror = function() { reject(); };
		document.body.appendChild(scriptTag);
	});
}

FullCalendar = {};

window.addEventListener('load', async function() {
	if (typeof FullCalendar === 'undefined' || !FullCalendar.hasOwnProperty("globalPlugins")) {
		await $.getScript("//cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js");
		await $.getScript("//cdn.jsdelivr.net/npm/rrule@2.7.2/dist/es5/rrule.min.js");
		await $.getScript("//cdn.jsdelivr.net/npm/@fullcalendar/rrule@6.1.5/index.global.min.js");
	}
	if (typeof $.query === 'undefined') {
		await scriptToPromise("/revize/plugins/revize_calendar/jquery.query-object.js");
	}
	if (typeof doT === 'undefined') {
		await scriptToPromise("/revize/plugins/revize_calendar/doT.min.js");
	}
	if (typeof ics === 'undefined') {
		await scriptToPromise("/revize/plugins/revize_calendar/ics/ics.min.js");
	}
	if (typeof moment === 'undefined') {
		await scriptToPromise("/revize/plugins/revize_calendar/moment.min.js");
	}
	window.dispatchEvent(new Event('RZCalendar.AssetsLoaded'));
});

window.addEventListener('RZCalendar.AssetsLoaded', function() {
	window.revizeCalendar.fns.preInit();
	window.revizeCalendar.fns.prepareImportData();
});
