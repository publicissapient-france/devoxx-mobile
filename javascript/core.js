define(['log', 'utils', 'collection', 'entry', 'register', 'ui', 'db'], function( log, utils, collection, entry, register, ui, db ) {
    
    var logger = log.getLogger('core');

    logger.info("Loading core.js");

    var EVENT_ID = '6';

    var TWITTER_USER_XEBIA = "xebiaFr";
    var TWITTER_USER_DEVOXXFR = "devoxxFR";

    var DEFAULT_TWITTER_USER = TWITTER_USER_XEBIA;

    var AUTHORIZED_TWITTER_USER = [TWITTER_USER_XEBIA, TWITTER_USER_DEVOXXFR];

    var core = { };

    var router;

    var favorites = { ids: [ ] };

    db.get('favorites', function(data) {
        if (data) {
            favorites = data.value;
        }
    });

    var CONFERENCE_DAYS = {
        6: {
            1: 'Mercredi 18 Avril',
            2: 'Jeudi 19 Avril',
            3: 'Vendredi 20 Avril'
        }
    };

    core.setupRouter = function() {
        logger.info("Instanciating jqmr router");

        router = new $.mobile.Router({
            "#schedule" : { handler : "onBeforeSchedulePageShow", events: "bs" },
            "#day(?:[?](.*))?" : { handler: "onBeforeDayPageShow", events: "bs" },
            "#events" : { handler : "onBeforeEventsPageShow", events: "bs" },
            "#event(?:[?](.*))?" : { handler : "onBeforeEventPageShow", events: "bs" },
            "#rooms" : { handler : "onBeforeRoomsPageShow", events: "bs" },
            "#room(?:[?](.*))?" : { handler : "onBeforeRoomPageShow", events: "bs" },
            "#presentations" : { handler : "onBeforePresentationsPageShow", events: "bs" },
            "#presentation(?:[?](.*))?" : { handler : "onBeforePresentationPageShow", events: "bs" },
            "#speakers" : { handler : "onBeforeSpeakersPageShow", events: "bs" },
            "#speaker(?:[?](.*))?" : { handler : "onBeforeSpeakerPageShow", events: "bs" },
            "#tracks" : { handler : "onBeforeTracksPageShow", events: "bs" },
            "#track(?:[?](.*))?" : { handler : "onBeforeTrackPageShow", events: "bs" },
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
            onBeforeRoomsPageShow: function(type, match, ui) {
                core.refreshRooms();
            },
            onBeforeRoomPageShow: function(type, match, ui) {
                var params = router.getParams(match[1]);
                core.refreshRoom(params.id);
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
            onBeforeTrackPageShow: function(type, match, ui) {
                var params = router.getParams(match[1]);
                core.refreshTrack(params.id);
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
            view: options.view,
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
            if (options.beforeReset) {
                options.beforeReset(data);
            }
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
            view: options.view,
            afterParse: function(data) {
                if (options.cacheKey && !data.statusCode) {
                    db.save(options.cacheKey, data);
                }
                if (options.afterParse) {
                    options.afterParse(data);
                }
            }
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

        db.getOrFetch(options.cacheKey, function(data) {
            if (options.beforeReset) {
                 options.beforeReset(data);
            }

            entry.views[options.view].entry.set(data);
            ui.hideFlashMessage(options);
        }, function() {
            entry.views[options.view].entry.fetch(fetchOptions);
        } );
    };


    core.refreshSchedule = function() {
        ui.resetFlashMessages("#schedule");
        ui.switchTitle("Planning");

        core.refreshDataList({
            page: "#schedule", title: "Planning", el: "#schedule-list", view: "schedule", template: $("#schedule-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/schedule?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/schedule',
            parse: function(data) {
                _.each(data, function(presentation) {
                    if (presentation.presentationUri) {
                        presentation.key = Number(presentation.presentationUri.substring(presentation.presentationUri.lastIndexOf("/") + 1));
                        presentation.favorite = favorites && _(favorites.ids).contains(presentation.key);
                    }
                    presentation.startTime = core.getScheduleTime(presentation.fromTime);
                    presentation.endTime = core.getScheduleTime(presentation.toTime);
                });

                return data;
            },
            beforeReset: function(data) {
                _.each(data, function(presentation) {
                    if (presentation.presentationUri) {
                        presentation.favorite = favorites && _(favorites.ids).contains(Number(presentation.key));
                    }
                });

                return data;
            },
            postRender: function(data) {
                core.initSwipeFavorites("presentation-schedule-item");
            }
        });
    };

    core.refreshDay = function(id) {
        ui.resetFlashMessages("#day");
        logger.info("Processing day: " + id);
        var title = "Jour " + id;
        if (CONFERENCE_DAYS[EVENT_ID] && CONFERENCE_DAYS[EVENT_ID][id]) {
            title = CONFERENCE_DAYS[EVENT_ID][id];
        }
        ui.switchTitle(title);
        core.refreshDataList({
            page: "#day", title: title, el: "#day-list", view: "day", template: $("#schedule-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/schedule/day/' + id + '?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/schedule/day/' + id,
            parse: function(data) {
                _.each(data, function(presentation) {
                    if (presentation.presentationUri) {
                        presentation.key = presentation.presentationUri.substring(presentation.presentationUri.lastIndexOf("/") + 1);
                        presentation.favorite = favorites && _(favorites.ids).contains(Number(presentation.key));
                    }
                    presentation.startTime = core.getScheduleTime(presentation.fromTime);
                    presentation.endTime = core.getScheduleTime(presentation.toTime);
                });

                return data;
            },
            beforeReset: function(data) {
                _.each(data, function(presentation) {
                    if (presentation.presentationUri) {
                        presentation.favorite = favorites && _(favorites.ids).contains(Number(presentation.key));
                    }
                });

                return data;
            },
            postRender: function(data) {
                core.initSwipeFavorites("presentation-day-item");
            }
        });
    };

    core.getScheduleTime = function(fromTime) {
        return Date.parseExact(fromTime.substring(0, fromTime.lastIndexOf('.')), 'yyyy-MM-dd HH:mm:ss').toString("HH:mm");
    };

    core.refreshEvents = function() {
        ui.resetFlashMessages("#events");
        logger.info("Refreshing events");
        ui.switchTitle("Evénements");

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
        ui.switchTitle("Evénement");

        core.refreshDataEntry({
            page: "#event", title: "Event", el: "#event-content", view: "event", template: $("#event-tpl").html(),
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

    core.refreshPresentations = function() {
        ui.resetFlashMessages("#presentations");
        logger.info("Refreshing presentations");
        ui.switchTitle("Présentations");

        core.refreshDataList({
            page: "#presentations", title: "Presentations", el: "#presentation-list", view: "presentation", template: $("#presentation-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/presentations?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/presentations',
            parse: function(data) {
                _.each(data, function(presentation) {
                    presentation.favorite = favorites && _(favorites.ids).contains(presentation.id);
                });

                return data;
            },
            beforeReset: function(data) {
                _.each(data, function(presentation) {
                    presentation.favorite = favorites && _(favorites.ids).contains(presentation.id);
                });

                return data;
            },
            postRender: function(data) {
                core.initSwipeFavorites("presentation-item");
            }
        });
    };

    core.refreshPresentation = function(id) {
        ui.resetFlashMessages("#presentation");
        logger.info("Processing presentation: " + id);
        ui.switchTitle("Présentation");
        core.refreshDataEntry({
            page: "#presentation", title: "Présentation", el: "#presentation-content", view: "presentation", template: $("#presentation-tpl").html(),
            url: utils.getFullUrl('/events/presentations/' + id + '?callback=?'),
            cacheKey: '/events/presentations/' + id,
            parse: function(data) {
                data.favorite = favorites && _.contains(favorites.ids, data.id);
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
            beforeReset: function(data) {
                data.favorite = favorites && _.contains(favorites.ids, data.id);

                return data;
            }
        });
    };

    core.refreshRooms = function() {
        ui.resetFlashMessages("#rooms");
        logger.info("Refreshing rooms");
        ui.switchTitle("Salles");

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
        ui.switchTitle("Tracks");

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
        ui.switchTitle("Speakers");

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
        ui.switchTitle("Speaker");

        core.refreshDataEntry({
            page: "#speaker", title: "Speaker", el: "#speaker-content", view: "speaker", template: $("#speaker-tpl").html(),
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

    core.refreshTrack = function(id) {
        ui.resetFlashMessages("#track");
        logger.info("Refreshing track");
        ui.switchTitle("Track");

        core.refreshDataList({
            page: "#track", title: "Track", el: "#track-presentation-list", view: "track", template: $("#presentation-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/tracks/' + id + '?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/track/' + id,
            parse: function(data) {
                _.each(data, function(presentation) {
                    presentation.favorite = favorites && _(favorites.ids).contains(presentation.id);
                });

                return data;
            },
            beforeReset: function(data) {
                _.each(data, function(presentation) {
                    presentation.favorite = favorites && _(favorites.ids).contains(presentation.id);
                });

                return data;
            },
            postRender: function(data) {
                if (data.length > 0) {
                    ui.switchTitle(data[0].get('track'));
                }
                core.initSwipeFavorites("presentation-item");
            }
        });
    };

    core.refreshRoom = function(id) {
        ui.resetFlashMessages("#room");
        logger.info("Refreshing room");
        ui.switchTitle("Room");

        core.refreshDataList({
            page: "#room", title: "Room", el: "#room-presentation-list", view: "room", template: $("#presentation-list-tpl").html(),
            url: utils.getFullUrl('/events/' + EVENT_ID + '/rooms/' + id + '?callback=?'),
            cacheKey: '/events/' + EVENT_ID + '/room/' + id,
            parse: function(data) {
                _.each(data, function(presentation) {
                    presentation.favorite = favorites && _(favorites.ids).contains(presentation.id);
                });

                return data;
            },
            beforeReset: function(data) {
                _.each(data, function(presentation) {
                    presentation.favorite = favorites && _(favorites.ids).contains(presentation.id);
                });

                return data;
            },
            postRender: function(data) {
                if (data.length > 0) {
                    ui.switchTitle(data[0].get('room'));
                }
                core.initSwipeFavorites("presentation-item");
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
        $( '.ui-title' ).html( '<img src="image/twitter-white-transparent.png" class="twitter-header-img" style="height:18px;" />' || "" );

        core.refreshDataList({
            page: "#twitter", title: "Twitter", el: "#twitter-timeline", view: "twitter", template: $("#twitter-timeline-tpl").html(),
            url: OFFLINE ? utils.getFullUrl('/twitter/' + screenName + '?callback=?') :
                "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=" + screenName + "&contributor_details=false&include_entities=false&include_rts=true&exclude_replies=true&count=50&exclude_replies=false&callback=?",
            parse: function(data) {
                _(data).each(function(tweet) {
                    tweet.formattedDate = Date.parse(tweet.created_at) ? Date.parse(tweet.created_at).toString("HH:mm") : "--:--";
                    var iconUrl = tweet.user.profile_image_url.replace(/_normal(\.[^\.]+)$/, "$1");
                    tweet.user.icon = iconUrl;
                    tweet.htmlText = core.twitter_linkify(tweet.text);
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

    core.twitter_linkify = function(text) {
        text = text.replace(/(https?:\/\/\S+)/gi, function (s) {
            return '<a href="' + s + '" target="_blank">' + s + '</a>';
        });

        text = text.replace(/(^|)@(\w+)/gi, function (s) {
            return '<a href="http://twitter.com/' + s + '" target="_blank">' + s + '</a>';
        });

        text = text.replace(/(^|)#(\w+)/gi, function (s) {
            return '<a href="http://search.twitter.com/search?q=' + s.replace(/#/,'%23') + '" target="_blank">' + s + '</a>';
         });
        return text;
    };

    core.initSwipeFavorites = function(classId) {
        $('ul li.' + classId).bind('swipeleft', function(e) {
            var presentationItem = $(this);
            var presentationId = Number(presentationItem.attr('data-id'));

            if ( _(favorites.ids).contains(presentationId) ) {
                favorites.ids.splice(favorites.ids.indexOf(presentationId), 1);
                db.save('favorites', favorites);
                presentationItem.removeClass('ui-btn-up-e');
                presentationItem.addClass('ui-btn-up-c');
                presentationItem.attr('data-theme', 'c');
            }
        });

        $('ul li.' + classId).bind('swiperight', function(e) {
            var presentationItem = $(this);
            var presentationId = Number(presentationItem.attr('data-id'));

            if ( !_(favorites.ids).contains(presentationId) ) {
                favorites.ids.push(presentationId);
                db.save('favorites', favorites);
                presentationItem.removeClass('ui-btn-up-c');
                presentationItem.addClass('ui-btn-up-e');
                presentationItem.attr('data-theme', 'e');
            }
        });
    };

    core.onFavoriteStarClick = function (presentationId, el) {
        presentationId = Number(presentationId);

        var favorite = _.contains(favorites.ids, presentationId);
        if ( favorite ) {
            favorites.ids.splice(favorites.ids.indexOf(presentationId), 1);
        }
        else {
            favorites.ids.push(presentationId);
        }
        db.save('favorites', favorites);
        $(el).attr("src", "image/star_" + (!favorite ? 'plain' : 'empty') + ".png");
    };

    logger.info("Loaded core");

    return core;

});