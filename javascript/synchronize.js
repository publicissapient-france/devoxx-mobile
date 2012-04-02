define( ['log', 'db', 'ui'], function( log, db, ui ) {

    var logger = log.getLogger('synchronize');

    logger.info("Loading synchronize.js");

    logger.info("Defining synchronize object");

    var synchronize = {
        urls: []
    };

    logger.info("Loaded synchronize");

    var askCancel = false;

    synchronize.addUrl = function(cacheKey, url) {
        synchronize.urls.push( {
            cacheKey: cacheKey,
            url: url
        } );
    };

    synchronize.beforePageShow = function() {
        ui.resetFlashMessages("#synchronize");
        synchronize.registerBindings();
    };

    synchronize.registerBindings = function() {
        $("#synchronize-home-submit").bind('click', synchronize.onSubmit);
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
        askCancel = true;
    };

    synchronize.startSynchronization = function() {
        synchronize.askCancel = false;
        $("#synchronize-home").hide();
        $("#synchronize-running").show();
        var urls = $.extend([], synchronize.urls);
        synchronize.synchronize(urls);
    };

    synchronize.synchronize = function(urls) {
        if (_(urls).isEmpty() || askCancel) {
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
        synchronize.finalizeSynchronization(options);
        ui.showFlashMessage( { page: '#synchronize', type: 'error', message: 'Erreur lors de la synchronisation !' } );
        logger.info("Synchronization ended with error");
    };

    synchronize.finalizeSynchronization = function(options) {
        $("#synchronize-running").hide();
        $("#synchronize-home").show();
        $.mobile.silentScroll(0);
    };

    return synchronize;

});
