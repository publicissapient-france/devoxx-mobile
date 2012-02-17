define(['log', 'utils', 'collection', 'ui'], function( log, utils, collection, ui ) {
    
    var logger = log.getLogger('core');

    logger.info("Loading core.js");

    var EVENT_ID = '4';

    var core = { };

    var router;

    core.init = function() {
        logger.info("Instanciating jqmr router");

        router = new $.mobile.Router({
            "#schedule" : { handler : "onBeforeSchedulePageShow", events: "bs" },
            "#events" : { handler : "onBeforeEventPageShow", events: "bs" },
            "#authors" : { handler : "onBeforeAuthorPageShow", events: "bs" }
        },
        {
            onBeforeSchedulePageShow: function(type, match, ui) {
                core.refreshSchedule();
            },
            onBeforeEventPageShow: function(type, match, ui) {
                 core.refreshEvents();
            },
            onBeforeAuthorPageShow: function(type, match, ui) {
                 core.refreshAuthors();
            }
        });

        logger.info("Instanciated jqmr router");
    };

    core.onFetchSuccess = function(model, resp, options) {
        setInterval(function() {
            $.mobile.hidePageLoadingMsg();
            ui.hideFlashMessage(options);
        }, 0);
    };

    core.onFetchError = function(originalModel, resp, errOptions, options) {
        setInterval(function() {
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
            sync: core.sync,
            beforeParse: options.beforeParse
        });

        if (collection.views[options.view].collection.length !== 0) {
            collection.views[options.view].collection.reset([]);
        }

        logger.info("Fetch " + options.title + " Data from url: '" + collection.views[options.view].collection.url + "'");
        collection.views[options.view].collection.fetch({
            success: function(model, resp) {
                if (options.success) {
                    options.success(model, resp);
                }
                core.onFetchSuccess(model, resp, options);
            } ,
            error: function (originalModel, resp, errOptions) { core.onFetchError(originalModel, resp, errOptions, options) },
            fetchUrl: options.url
        });
    };

    core.refreshSchedule = function() {
        core.refreshDataList({
            page: "#schedule", title: "Schedule", el: "#slot-list", view: "schedule", template: $("#slot-list-tpl").html(),
            url: utils.getFullUrl('events/' + EVENT_ID + '/schedule?callback=?'),
            parse: function(data) { return data; }
        });
    };

    core.refreshEvents = function() {
        logger.info("Refreshing events");
        core.refreshDataList({
            page: "#events", title: "Event", el: "#event-list", view: "events", template: $("#event-list-tpl").html(),
            url: utils.getFullUrl('events?callback=?'),
            parse: function(data) { return data; }
        });
    };

    core.refreshAuthors = function() {
        logger.info("Refreshing authors");
        core.refreshDataList({
            page: "#authors", title: "Author", el: "#author-list", view: "author", template: $("#author-list-tpl").html(),
            url: utils.getFullUrl('events/' + EVENT_ID + '/speakers?callback=?'),
            parse: function(data) { return data; }
        });
    };

    logger.info("Loaded core");

    return core;

});
