define(['log', 'utils', 'collection', 'entry', 'register', 'ui', 'db'], function( log, utils, collection, entry, register, ui, db ) {
    
    var logger = log.getLogger('core');

    logger.info("Loading core.js");
    ui.updateSplashscreenMessage("Chargement module core");

    var EVENT_ID = '6';

    var TWITTER_USER_XEBIA = "xebiaFr";
    var TWITTER_USER_DEVOXXFR = "devoxxFR";

    var DEFAULT_TWITTER_USER = TWITTER_USER_XEBIA;

    var AUTHORIZED_TWITTER_USER = [TWITTER_USER_XEBIA, TWITTER_USER_DEVOXXFR];

    var core = { };

    var router;

    var favorites = { ids: [ 1188, 1366, 1198, 1451, 1194, 1188, 1078, 1432, 1085, 1003, 1457 ] };
    /*
        db.get('favorites', function(data) {
            favorites = JSON.parse(data);
        });
    */

    core.setupRouter = function() {
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
            "#tracks" : { handler : "onBeforeTracksPageShow", events: "bs" },
            "#register":{ handler:"onBeforeRegisterPageShow", events:"bs" },
            "#twitter(?:[?](.*))?":{ handler:"onBeforeTwitterPageShow", events:"bs" },
            "#xebia-program": { handler : "onBeforeXebiaProgramPageShow", events: "bs" }
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
            },
            onBeforeRegisterPageShow: function(type, match, ui) {
                register.beforePageShow();
            },
            onBeforeTwitterPageShow: function(type, match, ui) {
                var params = router.getParams(match[1]);
                var twitterAccount = !!params ? params.screenname : undefined;
                core.refreshTwitter( twitterAccount );
            },
            onBeforeXebiaProgramPageShow: function(type, match, ui) {
                core.refreshXebiaProgram();
            }
        });

        logger.info("Instanciated jqmr router");
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
            beforeParse: options.beforeParse,
            afterParse: function(data) {
                if (options.cacheKey && !data.statusCode) {
                    db.save(options.cacheKey, data);
                }
                if (options.afterParse) {
                    options.afterParse(data);
                }
            }
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

        db.getOrFetch(options.cacheKey, function(data) {
            collection.views[options.view].collection.reset(data);
            ui.hideFlashMessage(options);
        }, function() {
            collection.views[options.view].el.empty();
            collection.views[options.view].collection.fetch(fetchOptions);
        } );
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
            postRender: options.postRender,
            afterParse: function(data) {
                if (options.cacheKey && !data.statusCode) {
                    db.save(options.cacheKey, data);
                }
                if (options.afterParse) {
                    options.afterParse(data);
                }
            }
        });

        if (options.events) {
            _.each(options.events, function(event) {
                entry.views[options.view].on(event.key, event.value, entry.views[options.view]);
            });
        }

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

        db.getOrFetch(options.cacheKey, function(data) {
            entry.views[options.view].entry.set(data);
            ui.hideFlashMessage(options);
        }, function() {
            entry.views[options.view].entry.fetch(fetchOptions);
        } );
    };


    core.refreshSchedule = function() {
        ui.resetFlashMessages("#schedule");
        core.refreshDataList({
            page: "#schedule", title: "Schedule", el: "#schedule-list", view: "schedule", template: $("#schedule-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/schedule?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/schedule',
            parse: function(data) {
                _.each(data, function(presentation) {
                    if (presentation.presentationUri) {
                        presentation.key = Number(presentation.presentationUri.substring(presentation.presentationUri.lastIndexOf("/") + 1));
                        presentation.favorite = _(favorites.ids).contains(presentation.key);
                    }
                    presentation.startTime = core.getScheduleTime(presentation.fromTime);
                    presentation.endTime = core.getScheduleTime(presentation.toTime);
                });

                return data;
            }
        });
    };

    core.refreshDay = function(id) {
        ui.resetFlashMessages("#day");
        logger.info("Processing day: " + id);
        ui.switchTitle("Jour " + id);
        core.refreshDataList({
            page: "#day", title: "Jour " + id, el: "#day-list", view: "day", template: $("#schedule-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/schedule/day/' + id + '?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/schedule/day/' + id,
            parse: function(data) {
                _.each(data, function(presentation) {
                    presentation.favorite = _(favorites.ids).contains(presentation.id);
                    if (presentation.presentationUri) {
                        presentation.key = presentation.presentationUri.substring(presentation.presentationUri.lastIndexOf("/") + 1);
                    }
                    presentation.startTime = core.getScheduleTime(presentation.fromTime);
                    presentation.endTime = core.getScheduleTime(presentation.toTime);
                });

                return data;
            }
        });
    };

    core.getScheduleTime = function(fromTime) {
        return Date.parseExact(fromTime.substring(0, fromTime.lastIndexOf('.')), 'yyyy-MM-dd HH:mm:ss').toString("HH:mm");
    };

    core.refreshEvents = function() {
        ui.resetFlashMessages("#events");
        logger.info("Refreshing events");
        core.refreshDataList({
            page: "#events", title: "Event", el: "#event-list", view: "events", template: $("#event-list-tpl").html(),
            url: utils.getFullUrl('/events?callback=?'),
            cacheKey: '/events',
            parse: function(data) { return data; }
        });
    };

    core.refreshEvent = function(id) {
        ui.resetFlashMessages("#event");
        logger.info("Processing event: " + id);
        core.refreshDataEntry({
            page: "#event", title: "Event", el: "#event-details", view: "event", template: $("#event-tpl").html(),
            url: utils.getFullUrl('/events/' + id + '?callback=?'),
            cacheKey: '/events/' + id,
            parse: function(data) {
                return data;
            },
            postRender: function(data) {
                $('#event-details-list').listview();
                ui.switchTitle(data.get('name'));
            }

        });
    };

    core.refreshPresentations = function(filter) {
        ui.resetFlashMessages("#presentations");
        logger.info("Refreshing presentations");
        core.refreshDataList({
            page: "#presentations", title: "Presentation", el: "#presentation-list", view: "presentation", template: $("#presentation-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/presentations?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/presentations',
            parse: function(data) {
                if(filter) {
                    return _.filter(data, filter);
                }

                _.each(data, function(presentation) {
                    presentation.favorite = _(favorites.ids).contains(presentation.id);
                });

                return data;
            }
        });
    };

    core.refreshPresentation = function(id) {
        ui.resetFlashMessages("#presentation");
        logger.info("Processing presentation: " + id);
        core.refreshDataEntry({
            page: "#presentation", title: "Presentation", el: "#presentation-details", view: "presentation", template: $("#presentation-tpl").html(),
            url: utils.getFullUrl('/events/presentations/' + id + '?callback=?'),
            cacheKey: '/events/presentations/' + id,
            parse: function(data) {
                data.favorite = _.contains(favorites.ids, data.id);
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
            },
            events: [
                { key: "click .favoriteImg",  value: function() {
                    if(this.get('favorite')){
                       favorites.push(this.get('id'));
                    } else {
                        favorites.splice(favorites.indexOf(this.get('id')),1);
                    }
                    db.save('favorites',favorites);
                    $(".favoriteImg").toggle("filled");

                } }
            ]
        });
    };

    core.refreshRooms = function() {
        ui.resetFlashMessages("#rooms");
        logger.info("Refreshing rooms");
        core.refreshDataList({
            page: "#rooms", title: "Rooms", el: "#room-list", view: "room", template: $("#room-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/schedule/rooms?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/schedule/rooms',
            parse: function(data) { return data; }
        });
    };

    core.refreshTracks = function() {
        ui.resetFlashMessages("#tracks");
        logger.info("Refreshing tracks");
        core.refreshDataList({
            page: "#tracks", title: "Tracks", el: "#track-list", view: "track", template: $("#track-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/tracks?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/tracks',
            parse: function(data) { return data; }
        });
    };

    core.refreshSpeakers = function() {
        ui.resetFlashMessages("#tracks");
        logger.info("Refreshing speakers");
        core.refreshDataList({
            page: "#speakers", title: "Speakers", el: "#speaker-list", view: "speaker", template: $("#speaker-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/speakers?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/speakers',
            parse: function(data) { return data; }
        });
    };

    core.refreshSpeaker = function(id) {
        ui.resetFlashMessages("#speaker");
        logger.info("Processing speaker: " + id);
        core.refreshDataEntry({
            page: "#speaker", title: "Speaker", el: "#speaker-details", view: "speaker", template: $("#speaker-tpl").html(),
            url: utils.getFullUrl('/events/speakers/' + id + '?callback=?'),
            cacheKey: '/events/speakers/' + id,
            parse: function(data) {
                _.each(data.talks, function(presentation) {
                     presentation.id = presentation.presentationUri.substring(presentation.presentationUri.lastIndexOf("/") + 1);
                 });
                return data;
            },
            postRender: function(data) {
                $('#speaker-details-list').listview();
                $('#speaker-talk-list').listview();
                var title = data.get('firstName') ? data.get('firstName')  : "";
                title += (data.get('firstName') && data.get('lastName')) ? " " : "";
                title += data.get('lastName') ? data.get('lastName') : "";
                ui.switchTitle(title ? title : "Speaker");
            }

        });
    };

    core.refreshTwitter = function(screenName) {
        if (!_(AUTHORIZED_TWITTER_USER).contains(screenName)) {
            screenName = DEFAULT_TWITTER_USER;
        }

        $(screenName === TWITTER_USER_XEBIA ? '#twitter-devoxxfr' : '#twitter-xebiafr').removeClass("ui-btn-active");
        $(screenName === TWITTER_USER_XEBIA ? '#twitter-xebiafr' : '#twitter-devoxxfr').addClass("ui-btn-active");

        console.log("Requested screen name : " + screenName);
        ui.resetFlashMessages("#twitter");
        logger.info("Processing tweets");
        core.refreshDataList({
            page: "#twitter", title: "Twitter", el: "#twitter-timeline", view: "twitter", template: $("#twitter-timeline-tpl").html(),
            url: OFFLINE ? utils.getFullUrl('/twitter/' + screenName + '?callback=?') :
                "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=" + screenName + "&include_rts=true&exclude_replies=true&count=50&callback=?",
            parse: function(data) {
                console.log( data);
                _(data).each(function(tweet) {
                    tweet.formattedDate = Date.parse(tweet.created_at).toString("HH:mm");
                    var iconUrl = tweet.user.profile_image_url.replace(/_normal(\.[^\.]+)$/, "$1");
                    tweet.user.icon = iconUrl;
                });
                return data;
            },
            postRender: function(data) {
                console.log("post render");
            }

        });
    };

    core.refreshXebiaProgram = function(filter) {
        ui.resetFlashMessages("#xebia-program");
        logger.info("Refreshing Xebia Program");
        core.refreshDataList({
            page: "#xebia-program", title: "Programme Xebia", el: "#xebia-program-list", view: "xebia-program", template: $("#xebia-program-list-tpl").html(),
            url: "http://devoxx-xebia.cloudfoundry.com/xebia/program?callback=?",
            cacheKey: '/xebia/program',
            parse: function(data) {
                return data;
            }
        });
    };

    logger.info("Loaded core");

    return core;

});