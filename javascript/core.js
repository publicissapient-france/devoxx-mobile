define(['log', 'utils', 'collection', 'entry', 'ui', 'db', 'synchronize'], function( log, utils, collection, entry, ui, db, synchronize ) {
    
    var logger = log.getLogger('core');

    logger.info("Loading core.js");

    var EVENT_ID = '15';

    var core = { };

    var router;

    var EVENTS = {
        events: [ {
            id: '15',
            name: 'Devoxx France 2015',
            days: [
                {
                    id: '1',
                    name: 'Mercredi 8 Avril',
                    date: '2015-04-08'
                }, {
                    id: '2',
                    name: 'Jeudi 9 Avril',
                    date: '2015-04-09'
                }, {
                    id: '3',
                    name: 'Vendredi 10 Avril',
                    date: '2015-04-10'
                }
            ]
        } ]
    };

    core.getEvent = function(eventId) {
        return _(EVENTS.events).find(function(event) { return event.id == eventId; });
    };

    core.getDay = function(event, dayId) {
        return _(event.days).find(function(day) { return day.id == dayId; });
    };

    var PAGE_CONTEXTS = {
    };

    core.createPageContext = function(page) {
        PAGE_CONTEXTS[page] = {
            initialized: false
        };
    };

    core.initializePageContextIfNecessary = function (page) {
        if (!PAGE_CONTEXTS[page]) {
            core.createPageContext(page);
        }
    };

    core.getPageContextValue = function(page, key) {
        core.initializePageContextIfNecessary(page);
        return PAGE_CONTEXTS[page][key];
    };

    core.getPageContexts = function() {
        return PAGE_CONTEXTS;
    };

    core.setPageContextValue = function(page, key, value) {
        core.initializePageContextIfNecessary(page);
        PAGE_CONTEXTS[page][key] = value;
    };

    core.clearPageContexts = function() {
        _(core.getPageContexts()).each(function(pageContext) {
             if (pageContext["id"]) {
                 pageContext["id"] = undefined;
             }
            if (pageContext["initialized"]) {
                pageContext["initialized"] = false;
            }
        });
    };

    core.addUrlsForEvent = function(eventId) {
        synchronize.addUrl(eventId + '/schedule', utils.getFullUrl('/' + eventId + '/schedule?callback=?') );
        synchronize.addUrl(eventId + '/presentations', utils.getFullUrl( '/' + eventId + '/presentations?callback=?') );
        synchronize.addUrl(eventId + '/rooms', utils.getFullUrl( '/' + eventId + '/rooms?callback=?') );
        synchronize.addUrl(eventId + '/tracks', utils.getFullUrl( '/' + eventId + '/tracks?callback=?') );
        synchronize.addUrl(eventId + '/speakers', utils.getFullUrl( '/' + eventId + '/speakers?callback=?') );
    };

    function refreshPageOnIdChange(type, match, ui, page, e, refreshFunction, fallbackFunction) {
        var params = router.getParams(match[1]);
        if (core.getPageContextValue(page.id, "id") !== params.id) {
            core.setPageContextValue(page.id, "initialized", true);
            core.setPageContextValue(page.id, "id", params.id);
            refreshFunction(params.id);
        }
        else if (fallbackFunction) {
            fallbackFunction(type, match, ui, page, e);
        }
    }

    function refreshPageOnChange(type, match, ui, page, e, refreshFunction, fallbackFunction) {
        var params = router.getParams(match[1]);
        if (!core.getPageContextValue(page.id, "initialized")) {
            core.setPageContextValue(page.id, "initialized", true);
            refreshFunction(params);
        }
        else if (fallbackFunction) {
            fallbackFunction(type, match, ui, page, e);
        }
    }

    function refreshPage(type, match, ui, page, e, refreshFunction) {
        var params = router.getParams(match[1]);
        refreshFunction(params);
    }

    core.setupRouter = function() {
        logger.info("Instanciating jqmr router");

        router = new $.mobile.Router({
            "#schedule" : { handler : "onBeforeSchedulePageShow", events: "bs" },
            "#day(?:[?](.*))" : { handler: "onBeforeDayPageShow", events: "bs" },
            "#event(?:[?](.*))" : { handler : "onBeforeEventPageShow", events: "bs" },
            "#rooms" : { handler : "onBeforeRoomsPageShow", events: "bs" },
            "#room(?:[?](.*))" : { handler : "onBeforeRoomPageShow", events: "bs" },
            "#presentations" : { handler : "onBeforePresentationsPageShow", events: "bs" },
            "#presentation(?:[?](.*))" : { handler : "onBeforePresentationPageShow", events: "bs" },
            "#speakers" : { handler : "onBeforeSpeakersPageShow", events: "bs" },
            "#speaker(?:[?](.*))" : { handler : "onBeforeSpeakerPageShow", events: "bs" },
            "#tracks" : { handler : "onBeforeTracksPageShow", events: "bs" },
            "#track(?:[?](.*))" : { handler : "onBeforeTrackPageShow", events: "bs" },
            "#synchronize":{ handler:"onBeforeSynchronizePageShow", events:"bs" }
        },
        {
            onBeforeSchedulePageShow: function(type, match, ui, page, e) {
                refreshPageOnChange(type, match, ui, page, e, core.refreshSchedule, core.renderCollectionView);
            },
            onBeforeDayPageShow: function(type, match, ui, page, e) {
                refreshPageOnIdChange(type, match, ui, page, e, core.refreshDay, core.renderCollectionView);
            },
            onBeforeEventPageShow: function(type, match, ui, page, e) {
                refreshPageOnIdChange(type, match, ui, page, e, core.refreshEvent);
            },
            onBeforeRoomsPageShow: function(type, match, ui, page, e) {
                refreshPageOnChange(type, match, ui, page, e, core.refreshRooms);
            },
            onBeforeRoomPageShow: function(type, match, ui, page, e) {
                refreshPageOnIdChange(type, match, ui, page, e, core.refreshRoom, core.renderCollectionView);
            },
            onBeforeTracksPageShow: function(type, match, ui, page, e) {
                refreshPageOnChange(type, match, ui, page, e, core.refreshTracks);
            },
            onBeforeTrackPageShow: function(type, match, ui, page, e) {
                refreshPageOnIdChange(type, match, ui, page, e, core.refreshTrack, core.renderCollectionView);
            },
            onBeforePresentationsPageShow: function(type, match, ui, page, e) {
                refreshPageOnChange(type, match, ui, page, e, core.refreshPresentations, core.renderCollectionView);
            },
            onBeforePresentationPageShow: function(type, match, ui, page, e) {
                refreshPageOnIdChange(type, match, ui, page, e, core.refreshPresentation, core.renderEntryView);
            },
            onBeforeSpeakersPageShow: function(type, match, ui, page, e) {
                refreshPageOnChange(type, match, ui, page, e, core.refreshSpeakers);
            },
            onBeforeSpeakerPageShow: function(type, match, ui, page, e) {
                refreshPageOnIdChange(type, match, ui, page, e, core.refreshSpeaker);
            },
            onBeforeSynchronizePageShow: function(type, match, ui, page, e) {
                refreshPageOnChange(type, match, ui, page, e, core.onSynchronizeBeforePageShow);
            }
        });

        logger.info("Instanciated jqmr router");
    };

    core.refreshDataList = function(options) {
        logger.info("Loading " + options.title + " View");
        collection.views[options.view] = new collection.EntryListView({
            dataType: options.dataType,
            fetchUrl: options.url,
            el: options.el,
            collectionTemplate: options.template,
            parse: function(data) {
                if (options.cacheKey && !data.statusCode) {
                    db.save(options.cacheKey, data);
                }
                if (options.parse) {
                    data = options.parse(data);
                }

                return data;
            },
            view: options.view,
            postRender: options.postRender
        });

        if (collection.views[options.view].collection.length !== 0) {
            collection.views[options.view].collection.reset([]);
        }

        logger.info("Fetch " + options.title + " Data from url: '" + collection.views[options.view].collection.url + "'");

        var fetchOptions = {
            onFetch: function() {
                $.mobile.showPageLoadingMsg();
                ui.showFlashMessage(options);
            },
            success: function(model, resp) {
                if (options.success) {
                    options.success(model, resp);
                }
                core.onFetchSuccess(model, resp, options);
            } ,
            error: function (originalModel, resp, errOptions) { core.onFetchError(originalModel, resp, errOptions, options) },
            fetchUrl: options.url
        };

        db.getOrFetch(options.cacheKey, function(data) {
            if (options.parse) {
                data = options.parse(data);
            }
            collection.views[options.view].collection.reset(data);
            ui.hideFlashMessage(options);
        }, function() {
            if (fetchOptions.onFetch) {
                fetchOptions.onFetch();
            }
            collection.views[options.view].el.empty();
            collection.views[options.view].collection.fetch(fetchOptions);
        } );
    };

    core.refreshDataEntry = function(options) {
        logger.info("Loading " + options.title + " View");
        entry.views[options.view] = new entry.EntryView({
            dataType: options.dataType,
            fetchUrl: options.url,
            el: options.el,
            entryTemplate: options.template,
            parse: function(data) {
                if (options.cacheKey && !data.statusCode) {
                    db.save(options.cacheKey, data);
                }
                if (options.parse) {
                    data = options.parse(data);
                }

                return data;
            },
            postRender: options.postRender,
            view: options.view
        });

        if (entry.views[options.view].entry) {
            entry.views[options.view].entry.clear();
        }

        logger.info("Fetch " + options.title + " Data from url: '" + entry.views[options.view].entry.url + "'");

        var fetchOptions = {
            onFetch: function() {
                $.mobile.showPageLoadingMsg();
                logger.info("Show " + options.title + " page message!");
                ui.showFlashMessage(options);
            },
            success: function(model, resp) {
                if (options.success) {
                    options.success(model, resp);
                }
                core.onFetchSuccess(model, resp, options);
            } ,
            error: function (originalModel, resp, errOptions) { core.onFetchError(originalModel, resp, errOptions, options) },
            fetchUrl: options.url
        };

        db.getOrFetch(options.cacheKey, function(data) {
            if (options.parse) {
                data = options.parse(data);
            }
            entry.views[options.view].entry.set(data);
            ui.hideFlashMessage(options);
        }, function() {
            if (fetchOptions.onFetch) {
                fetchOptions.onFetch();
            }
            entry.views[options.view].entry.fetch(fetchOptions);
        } );
    };

    core.refreshSchedule = function() {
        ui.resetFlashMessages("#schedule");
        ui.switchTitle('schedule', "Planning");

        core.refreshDataList({
            page: "#schedule", title: "Planning", el: "#schedule-list", view: "schedule", template: $("#schedule-list-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/schedule?callback=?'),
            cacheKey: '/' + EVENT_ID + '/schedule',
            dataType: "session",
            parse: function(sessions) {
                _(sessions).each(core.enhanceSession);

                return sessions;
            }
        });
    };

    core.refreshDay = function(id) {
        ui.resetFlashMessages("#day");
        logger.info("Processing day: " + id);
        var day = core.getEventDay(id);
        var title = day ? day.name : "Jour " + id;
        ui.switchTitle('day', title);
        core.refreshDataList({
            page: "#day", title: title, el: "#day-list", view: "day", template: $("#schedule-list-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/schedule?callback=?'),
            cacheKey: '/' + EVENT_ID + '/schedule',
            dataType: "session",
            parse: function(sessions) {
                sessions = core.filterSessionsByDay(sessions, day);
                _(sessions).each(core.enhanceSession);

                return sessions;
            }
        });
    };

    core.refreshPresentations = function() {
        ui.resetFlashMessages("#presentations");
        logger.info("Refreshing presentations");
        ui.switchTitle('presentations', "Présentations");

        core.refreshDataList({
            page: "#presentations", title: "Presentations", el: "#presentation-list", view: "presentations", template: $("#presentation-list-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/presentations?callback=?'),
            cacheKey: '/' + EVENT_ID + '/presentations',
            dataType: "presentation",
            parse: function(presentations) {
                _(presentations).each(core.enhancePresentationListItem);

                return presentations;
            }
        });
    };

    core.refreshPresentation = function(id) {
        ui.resetFlashMessages("#presentation");
        logger.info("Processing presentation: " + id);
        ui.switchTitle('presentation', "Présentation");
        core.refreshDataEntry({
            page: "#presentation", title: "Présentation", el: "#presentation-content", view: "presentation", template: $("#presentation-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/presentations?callback=?'),
            cacheKey: '/' + EVENT_ID + '/presentations',
            dataType: "presentation",
            parse: function(presentations) {
                var presentation = core.findPresentationById(presentations, id);
                core.enhancePresentation(presentation);

                return presentation;
            },
            postRender: function(presentation) {
                $('#presentation-tag-list').listview();
                $('#presentation-speaker-list').listview();
                $('#presentation-details-list').listview();
                ui.switchTitle('presentation', presentation.get('title'));
            }
        });
    };

    core.refreshSpeakers = function() {
        ui.resetFlashMessages("#speakers");
        logger.info("Refreshing speakers");
        ui.switchTitle('speakers', "Speakers");

        core.refreshDataList({
            page: "#speakers", title: "Speakers", el: "#speaker-list", view: "speakers", template: $("#speaker-list-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/speakers?callback=?'),
            cacheKey: '/' + EVENT_ID + '/speakers',
            dataType: "speaker",
            parse: function(speakers) { return speakers; }
        });
    };

    core.refreshSpeaker = function(id) {
        ui.resetFlashMessages("#speaker");
        logger.info("Processing speaker: " + id);
        ui.switchTitle('speaker', "Speaker");

        core.refreshDataEntry({
            page: "#speaker", title: "Speaker", el: "#speaker-content", view: "speaker", template: $("#speaker-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/speakers?callback=?'),
            cacheKey: '/' + EVENT_ID + '/speakers',
            dataType: "speaker",
            parse: function(speakers) {
                var speaker = core.findSpeakerById(speakers, id);
                core.enhanceSpeaker(speaker);
                return speaker;
            },
            postRender: function(speaker) {
                $('#speaker-details-list').listview();
                $('#speaker-talk-list').listview();
                var title = speaker.get('firstName') ? speaker.get('firstName')  : "";
                title += (speaker.get('firstName') && speaker.get('lastName')) ? " " : "";
                title += speaker.get('lastName') ? speaker.get('lastName') : "";
                if (title) {
                    ui.switchTitle('speaker', title);
                }
            }
        });
    };

    core.refreshTracks = function() {
        ui.resetFlashMessages("#tracks");
        logger.info("Refreshing tracks");
        ui.switchTitle('tracks', "Tracks");

        core.refreshDataList({
            page: "#tracks", title: "Tracks", el: "#track-list", view: "tracks", template: $("#track-list-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/tracks?callback=?'),
            cacheKey: '/' + EVENT_ID + '/tracks',
            dataType: "track",
            parse: function(tracks) { return tracks; }
        });
    };

    core.refreshTrack = function(name) {
        ui.resetFlashMessages("#track");
        logger.info("Refreshing track");
        ui.switchTitle('track', "Track");

        core.refreshDataList({
            page: "#track", title: "Track", el: "#track-presentation-list", view: "track", template: $("#presentation-list-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/presentations?callback=?'),
            cacheKey: '/' + EVENT_ID + '/presentations',
            dataType: "presentation",
            parse: function(presentations) {
                presentations = core.filterPresentationsByTrackKey(presentations, name);
                _(presentations).each(core.enhancePresentationListItem);

                return presentations;
            },
            postRender: function(presentations) {
                if (presentations.length > 0) {
                    ui.switchTitle('track', presentations[0].get('track'));
                }
            }
        });
    };

    core.refreshRooms = function() {
        ui.resetFlashMessages("#rooms");
        logger.info("Refreshing rooms");
        ui.switchTitle('rooms', "Salles");

        core.refreshDataList({
            page: "#rooms", title: "Rooms", el: "#room-list", view: "rooms", template: $("#room-list-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/rooms?callback=?'),
            cacheKey: '/' + EVENT_ID + '/rooms',
            dataType: "room",
            parse: function(rooms) { return rooms; }
        });
    };

    core.refreshRoom = function(id) {
        ui.resetFlashMessages("#room");
        logger.info("Refreshing room");
        ui.switchTitle('room', "Room");

        core.refreshDataList({
            page: "#room", title: "Room", el: "#room-presentation-list", view: "room", template: $("#presentation-list-tpl").html(),
            url: utils.getFullUrl('/' + EVENT_ID + '/presentations?callback=?'),
            cacheKey: '/' + EVENT_ID + '/presentations',
            dataType: "presentation",
            parse: function(presentations) {
                presentations = core.filterPresentationsByRoomKey(presentations, id);
                _(presentations).each(core.enhancePresentationListItem);

                return presentations;
            },
            postRender: function(presentations) {
                if (presentations.length > 0) {
                    ui.switchTitle('room', presentations[0].get('room'));
                }
            }
        });
    };

    core.renderEntryView = function(type, match, ui, page, e) {
        entry.views[page.id].render();
    };

    core.renderCollectionView = function(type, match, ui, page, e) {
        collection.views[page.id].render();
    };

    core.onFetchSuccess = function(model, resp, options) {
        if (model.get('statusCode') == '404') {
            ui.showFlashMessage(_.extend({type: 'error', message: model.get('message')}, options));
        }
        setTimeout(function() {
            $.mobile.hidePageLoadingMsg();
            ui.hideFlashMessage(options);
        }, 0);
    };

    core.onFetchError = function(originalModel, resp, errOptions, options) {
        setTimeout(function() {
            logger.info("Error response tmp: '" + resp + "' for url: '" + options.fetchUrl + "'");
            $.mobile.hidePageLoadingMsg();
            ui.hideFlashMessage(options);
            ui.showFlashMessage(_.extend({type: 'error', message: 'No data found ...'}, options));
        }, 0);
    };

    core.getParams = function(hashparams){
        if (!hashparams) return null;
        var params={}, tmp;
        var tokens=hashparams.slice( hashparams.indexOf('?')+1 ).split("&");
        $.each(tokens,function(k,v){
            tmp=v.split("=");
            if (params[tmp[0]]){
                if (!(params[tmp[0]] instanceof Array)){
                    params[tmp[0]]=[ params[tmp[0]] ];
                }
                params[tmp[0]].push(tmp[1]);
            } else {
                params[tmp[0]]=tmp[1];
            }
        });
        if ($.isEmptyObject(params)) return null;
        return params;
    };

    core.getEventDay = function(id) {
        var event = core.getEvent(EVENT_ID);
        return core.getDay(event, id);
    };

    core.enhanceSession = function(session) {
        if (session.presentationUri) {
            session.presentationId = core.getPresentationIdFromUri(session.presentationUri);
        }
        session.startTime = core.getScheduleTime(session.fromTime);
        session.endTime = core.getScheduleTime(session.toTime);
    };

    core.filterSessionsByDay = function(sessions, day) {
        return _(sessions).filter(function (presentation) {
            return day && presentation.fromTime.substr(0, 10) === day.date;
        });
    };

    core.findEventById = function(events, id) {
         return _(events).find(function (event) {
             return event.id == id;
         });
    };

    core.getPresentationIdFromUri = function(presentationUri) {
        return Number(presentationUri.substring(presentationUri.lastIndexOf("/") + 1));
    };

    core.getScheduleTime = function(fromTime) {
        return Date.parseExact(fromTime, 'yyyy-MM-dd HH:mm:ss').toString("HH:mm");
    };

    core.enhancePresentationListItem = function(presentation) {
        core.updateLanguage(presentation);
    };

    core.getSpeakerIdFromUri = function(speakerUri) {
        return speakerUri.substring(speakerUri.lastIndexOf("/") + 1);
    };

    core.enhancePresentation = function(presentation) {
        core.updateLanguage(presentation);
         if (!presentation.enhanced) {
            presentation.summary = core.formatPresentationSummary(presentation);
            presentation.enhanced = true;
         }
        _(presentation.speakers).each(function(speaker) {
            speaker.id = speaker.id;
        });
    };

    core.findPresentationById = function(presentations, id) {
        return _(presentations).find(function (presentation) {
            return presentation.id == id;
        });
    };

    core.findSpeakerById = function(speakers, id) {
        return _(speakers).find(function (speaker) {
            return speaker.id == id;
        });
    };

    core.enhanceSpeaker = function(speaker) {
        if (!speaker.enhanced) {
            speaker.bio = utils.linkify(speaker.bio);
            speaker.enhanced = true;
        }
        _(speaker.talks).each(function(presentation) {
             presentation.id = core.getPresentationIdFromUri(presentation.presentationUri);
         });
    };


    core.filterPresentationsByTrackKey = function(presentations, track) {
	    track = track.replace(/[ ]/g, '_').replace(/[&<>,]/g, '').replace(/[éè]/g, 'e').toUpperCase();
        return _(presentations).filter(function (presentation) {
	        var presentationTrack = presentation.track.replace(/[ ]/g, '_').replace(/[&<>,]/g, '').replace(/[éè]/g, 'e').toUpperCase();
            return presentationTrack == track;
        });
    };

    core.filterPresentationsByRoomKey = function(presentations, room) {
	    room = room.replace(/[ ]/g, '_').replace(/[&<>,]/g, '').replace(/[éè]/g, 'e').toUpperCase();
         return _(presentations).filter(function (presentation) {
             var presentationRoom = presentation.room.replace(/[ ]/g, '_').replace(/[&<>,]/g, '').replace(/[éè]/g, 'e').toUpperCase();
	         return presentationRoom == room;
         });
     };

    core.updateLanguage = function(presentation) {
        if (presentation.language) {
            presentation.language = presentation.language.toUpperCase();
        }
    };

    core.onSynchronizeBeforePageShow = function() {
        synchronize.beforePageShow(core.clearPageContexts);
    };

    core.formatPresentationSummary = function(presentation) {
        return utils.linkify(presentation.summary.replace(/\n/g, '<br />'));
    };

    core.getDetailView = function(view) {
        return entry.views[view];
    };

    logger.info("Loaded core");

    core.addUrlsForEvent(EVENT_ID);

    return core;

});