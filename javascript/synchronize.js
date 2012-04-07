define( ['log', 'db', 'ui'], function( log, db, ui ) {

    var logger = log.getLogger('synchronize');

    logger.info("Loading synchronize.js");

    logger.info("Defining synchronize object");

    var synchronize = {
        urls: []
    };

    logger.info("Loaded synchronize");

    var shouldCancel = false;

    synchronize.addUrl = function(cacheKey, url) {
        synchronize.urls.push( {
            cacheKey: cacheKey,
            url: url
        } );
    };

    synchronize.beforePageShow = function(synchronizeCallback) {
        ui.resetFlashMessages("#synchronize");
        synchronize.registerBindings(synchronizeCallback);
    };

    synchronize.registerBindings = function(synchronizeCallback) {
        $("#synchronize-home-submit").bind('click', function(e) {
            if (synchronizeCallback) {
                synchronizeCallback();
            }
            synchronize.onSubmit(e);
        });
        $("#synchronize-running-submit").bind('click', synchronize.onCancel);
    };

    synchronize.onSubmit = function(e) {
        try {
            synchronize.startSynchronization();
        } catch(e) {
            console.info("Error catched: " + e);
        }

        e.preventDefault();
        return false;
    };

    synchronize.onCancel = function(e) {
        try {
            synchronize.askCancel();
        } catch(e) {
            console.info("Error catched: " + e);
        }

        e.preventDefault();
        return false;
    };

    synchronize.askCancel = function(e) {
        shouldCancel = true;
    };

    synchronize.startSynchronization = function() {
        synchronize.shouldCancel = false;
        $("#synchronize-home").hide();
        $("#synchronize-running").show();
        var urls = $.extend([], synchronize.urls);
        synchronize.synchronize(urls);
    };

    synchronize.synchronize = function(urls) {
        if (_(urls).isEmpty() || shouldCancel) {
            synchronize.onSuccess({});
            return ;
        }
        var entry = _(urls).head();
        $.ajax({
          url: entry.url,
          dataType: "jsonp",
          cache: false
        })
            .success(function(data, textStatus, jqXHR) {
                logger.info("Fetch succeded for url: " + entry.url);
                db.save(entry.cacheKey, data);
                var remainingUrls = _(urls).tail();
                synchronize.synchronize(remainingUrls);
            })
            .error(function(jqXHR, textStatus, errorThrown) {
                logger.info("Fetch failed for url: " + entry.url);
                synchronize.onError({
                    error: {
                        'textStatus': textStatus,
                        'errorThrown': errorThrown
                    }
                });
            })

    };


    synchronize.onSuccess = function(options) {
        synchronize.finalizeSynchronization(options);
        ui.resetFlashMessages("#synchronize");
        logger.info("Synchronization ended with success");
    };

    synchronize.onError = function(options) {
        logger.info("Synchronization ended with error");
        synchronize.finalizeSynchronization(options);
        ui.showFlashMessage( { page: '#synchronize', type: 'error', message: 'Erreur lors de la synchronisation !' } );
    };

    synchronize.finalizeSynchronization = function(options) {
        logger.info("Finalizing synchronization ...");
        $("#synchronize-running").hide();
        $("#synchronize-home").show();
        $.mobile.silentScroll(0);
    };

    return synchronize;

});
