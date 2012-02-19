define(['log', 'utils', 'collection', 'entry', 'ui'], function( log, utils, collection, entry, ui ) {
    
    var logger = log.getLogger('core');

    logger.info("Loading core.js");

    var EVENT_ID = '4';

    var core = { };

    var router;

    core.init = function() {
        logger.info("Instanciating jqmr router");

        router = new $.mobile.Router({
            "#schedule" : { handler : "onBeforeSchedulePageShow", events: "bs" },
            "#day(?:[?](.*))?" : { handler: "onBeforeDayPageShow", events: "bs" },
            "#events" : { handler : "onBeforeEventsPageShow", events: "bs" },
            "#event(?:[?](.*))?" : { handler : "onBeforeEventPageShow", events: "bs" },
            "#rooms" : { handler : "onBeforeRoomPageShow", events: "bs" },
            "#presentations" : { handler : "onBeforePresentationsPageShow", events: "bs" },
            "#presentation(?:[?](.*))?" : { handler : "onBeforePresentationPageShow", events: "bs" },
            "#speakers" : { handler : "onBeforeSpeakersPageShow", events: "bs" },
            "#speaker(?:[?](.*))?" : { handler : "onBeforeSpeakerPageShow", events: "bs" },
            "#tracks" : { handler : "onBeforeTracksPageShow", events: "bs" }
        },
        {
            onBeforeSchedulePageShow: function(type, match, ui) {
                core.refreshSchedule();
            },
            onBeforeEventsPageShow: function(type, match, ui) {
                 core.refreshEvents();
            },
            onBeforeEventPageShow: function(type, match, ui) {
                var params = router.getParams(match[1]);
                 core.refreshEvent(params.id);
            },
            onBeforeRoomPageShow: function(type, match, ui) {
                 core.refreshRooms();
            },
            onBeforeTracksPageShow: function(type, match, ui) {
                 core.refreshTracks();
            },
            onBeforePresentationsPageShow: function(type, match, ui) {
                 core.refreshPresentations();
            },
            onBeforePresentationPageShow: function(type, match, ui) {
                var params = router.getParams(match[1]);
                 core.refreshPresentation(params.id);
            },
            onBeforeSpeakersPageShow: function(type, match, ui) {
                 core.refreshSpeakers();
            },
            onBeforeSpeakerPageShow: function(type, match, ui) {
                var params = router.getParams(match[1]);
                 core.refreshSpeaker(params.id);
            },
            onBeforeDayPageShow: function(type, match, ui) {
                var params = router.getParams(match[1]);
                 core.refreshDay(params.id);
            }
        });

        logger.info("Instanciated jqmr router");
    };

    core.onFetchSuccess = function(model, resp, options) {
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

    core.refreshDataList = function(options) {
        $.mobile.showPageLoadingMsg();
        logger.info("Show " + options.title + " page message!");
        ui.showFlashMessage(options);

        logger.info("Loading " + options.title + " View");
        collection.views[options.view] = new collection.EntryListView({
            fetchUrl: options.url,
            el: options.el,
            collectionTemplate: options.template,
            parse: options.parse,
            beforeParse: options.beforeParse
        });

        if (collection.views[options.view].collection.length !== 0) {
            collection.views[options.view].collection.reset([]);
        }

        logger.info("Fetch " + options.title + " Data from url: '" + collection.views[options.view].collection.url + "'");

        var fetchOptions = {
            success: function(model, resp) {
                if (options.success) {
                    options.success(model, resp);
                }
                core.onFetchSuccess(model, resp, options);
            } ,
            error: function (originalModel, resp, errOptions) { core.onFetchError(originalModel, resp, errOptions, options) },
            fetchUrl: options.url
        };

        if (OFFLINE) {
            fetchOptions.jsonpCallback = DEBUG_JSON_CALLBACK;
        }

        collection.views[options.view].collection.fetch(fetchOptions);
    };

    core.refreshDataEntry = function(options) {
            $.mobile.showPageLoadingMsg();
            logger.info("Show " + options.title + " page message!");
            ui.showFlashMessage(options);

            logger.info("Loading " + options.title + " View");
            entry.views[options.view] = new entry.EntryView({
                fetchUrl: options.url,
                el: options.el,
                entryTemplate: options.template,
                parse: options.parse,
                beforeParse: options.beforeParse,
                postRender: options.postRender
            });

            if (entry.views[options.view].entry) {
                entry.views[options.view].entry.clear();
            }

            logger.info("Fetch " + options.title + " Data from url: '" + entry.views[options.view].entry.url + "'");

            var fetchOptions = {
                success: function(model, resp) {
                    if (options.success) {
                        options.success(model, resp);
                    }
                    core.onFetchSuccess(model, resp, options);
                } ,
                error: function (originalModel, resp, errOptions) { core.onFetchError(originalModel, resp, errOptions, options) },
                fetchUrl: options.url
            };

            if (OFFLINE) {
                fetchOptions.jsonpCallback = DEBUG_JSON_CALLBACK;
            }
            entry.views[options.view].entry.fetch(fetchOptions);
        };


    core.refreshSchedule = function() {
        core.refreshDataList({
            page: "#schedule", title: "Schedule", el: "#schedule-list", view: "schedule", template: $("#schedule-list-tpl").html(),
            url: utils.getFullUrl('events/' + EVENT_ID + '/schedule' + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) {
                _.each(data, function(slot) {
                    slot.startTime = core.getScheduleTime(slot.fromTime);
                    slot.endTime = core.getScheduleTime(slot.toTime);
                });

                return data;
            }
        });
    };

    core.refreshDay = function(id) {
        logger.info("Processing day: " + id);
        ui.switchTitle("Day " + id);
        core.refreshDataList({
            page: "#day", title: "Day " + id, el: "#day-list", view: "day", template: $("#schedule-list-tpl").html(),
            url: utils.getFullUrl('events/' + EVENT_ID + '/schedule/day/' + id + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) {
                _.each(data, function(slot) {
                    slot.startTime = core.getScheduleTime(slot.fromTime);
                    slot.endTime = core.getScheduleTime(slot.toTime);
                });

                return data;
            }
        });
    };

    core.getScheduleTime = function(fromTime) {
        return Date.parseExact(fromTime.substring(0, fromTime.lastIndexOf('.')), 'yyyy-MM-dd HH:mm:ss').toString("HH:mm");
    };

    core.refreshEvents = function() {
        logger.info("Refreshing events");
        core.refreshDataList({
            page: "#events", title: "Event", el: "#event-list", view: "events", template: $("#event-list-tpl").html(),
            url: utils.getFullUrl('events' + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) { return data; }
        });
    };

    core.refreshEvent = function(id) {
        logger.info("Processing event: " + id);
        core.refreshDataEntry({
            page: "#event", title: "Event", el: "#event-details", view: "event", template: $("#event-tpl").html(),
            url: utils.getFullUrl('events/' + id + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) {
                return data;
            },
            postRender: function(data) {
                $('#event-details-list').listview();
                ui.switchTitle(data.get('name'));
            }

        });
    };

    core.refreshPresentations = function() {
        logger.info("Refreshing presentations");
        core.refreshDataList({
            page: "#presentations", title: "Presentation", el: "#presentation-list", view: "presentation", template: $("#presentation-list-tpl").html(),
            url: utils.getFullUrl('events/' + EVENT_ID + '/presentations' + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) { return data; }
        });
    };

    core.refreshPresentation = function(id) {
        logger.info("Processing presentation: " + id);
        core.refreshDataEntry({
            page: "#presentation", title: "Presentation", el: "#presentation-details", view: "presentation", template: $("#presentation-tpl").html(),
            url: utils.getFullUrl('events/presentations/' + id + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) {
                _.each(data.speakers, function(speaker) {
                    speaker.id = speaker.speakerUri.substring(speaker.speakerUri.lastIndexOf("/") + 1);
                });
                return data;
            },
            postRender: function(data) {
                $('#presentation-tag-list').listview();
                $('#presentation-speaker-list').listview();
                $('#presentation-details-list').listview();
                ui.switchTitle(data.get('title'));
            }

        });
    };

    core.refreshRooms = function() {
        logger.info("Refreshing rooms");
        core.refreshDataList({
            page: "#rooms", title: "Rooms", el: "#room-list", view: "room", template: $("#room-list-tpl").html(),
            url: utils.getFullUrl('events/' + EVENT_ID + '/schedule/rooms' + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) { return data; }
        });
    };

    core.refreshTracks = function() {
        logger.info("Refreshing tracks");
        core.refreshDataList({
            page: "#tracks", title: "Tracks", el: "#track-list", view: "track", template: $("#track-list-tpl").html(),
            url: utils.getFullUrl('events/' + EVENT_ID + '/tracks' + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) { return data; }
        });
    };

    core.refreshSpeakers = function() {
        logger.info("Refreshing speakers");
        core.refreshDataList({
            page: "#speakers", title: "Speakers", el: "#speaker-list", view: "speaker", template: $("#speaker-list-tpl").html(),
            url: utils.getFullUrl('events/' + EVENT_ID + '/speakers' + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) { return data; }
        });
    };

    core.refreshSpeaker = function(id) {
        logger.info("Processing speaker: " + id);
        core.refreshDataEntry({
            page: "#speaker", title: "Speaker", el: "#speaker-details", view: "speaker", template: $("#speaker-tpl").html(),
            url: utils.getFullUrl('events/speakers/' + id + (OFFLINE ? '.json' : '') + '?callback=?'),
            parse: function(data) {
                _.each(data.talks, function(presentation) {
                     presentation.id = presentation.presentationUri.substring(presentation.presentationUri.lastIndexOf("/") + 1);
                 });
                return data;
            },
            postRender: function(data) {
                $('#speaker-details-list').listview();
                $('#speaker-talk-list').listview();
                ui.switchTitle(data.get('firstName') + " " + data.get('lastName'));
            }

        });
    };

    logger.info("Loaded core");

    return core;

});
