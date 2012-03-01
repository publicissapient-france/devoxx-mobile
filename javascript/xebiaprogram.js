define(['log', 'db', 'collection', 'db', 'ui'], function( log, db, collection, db, ui ) {

    var logger = log.getLogger('xebiaprogram');

    logger.info("Loading xebiaprogram.js");

    var XEBIAPROGRAM = "xebiaprogram";

    logger.info("Defining xebiaprogram object");

    var xebiaprogram = {};

    logger.info("Loaded xebiaprogram");

    xebiaprogram.onError = function(data, status) {
        console.log("Registration error");
    };

    xebiaprogram.beforePageShow =

        function() {
               // ui.resetFlashMessages("#events");
                logger.info("Refreshing xebia program");
                xebiaprogram.refreshDataList({
                    page: "#xebiaprogram", title: "Xebia Program", el: "#xebiaprogram-list", view: "xebiaprogram", template: $("#xebiaprogram-list-tpl").html(),
                    url: "file://localhost/Users/karesti/Documents/workspace/devoxx-mobile/data/xebia-program.json",
                    cacheKey: '/xebiaprogram',
                    parse: function(data) { return data; }
                });


    };

    xebiaprogram.refreshDataList = function(options) {
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

        if (OFFLINE) {
            fetchOptions.jsonpCallback = DEBUG_JSON_CALLBACK;
        }

        db.getOrFetch(options.cacheKey, function(data) {
            collection.views[options.view].collection.reset(data);
            ui.hideFlashMessage(options);
        }, function() {
            collection.views[options.view].collection.fetch(fetchOptions);
        } );
    };


    return xebiaprogram;

});
