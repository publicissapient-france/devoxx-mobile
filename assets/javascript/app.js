var DEBUG = false;

var WAIT_TIME = DEBUG ? 3000 : 0;

if (DEBUG) {
    console.log("Waiting for " + WAIT_TIME + "ms before loading application");
}

var init = function() {
    console.log("[app][init] Initializing require");

    console.log("[app][init][require] Setting config");

    require.config({
        paths: {
            'text':        'javascript/lib/require/require.text-1.0.2',
            'order':       'javascript/lib/require/require.order-1.0.5',
            'router':      'javascript/router',
            'core':        'javascript/core',
            'app':         'javascript/app',
            'utils':       'javascript/utils',
            'ui':          'javascript/ui',
            'db':          'javascript/db',
            'log':         'javascript/log',
            'collection':  'javascript/collection',
            'jqmr':        'javascript/lib/jquerymobile/jquery.mobile.router-0.6',
            'jqm':         'javascript/lib/jquerymobile/jquery.mobile-1.0.1',
            'phonegap':    'javascript/lib/phonegap/phonegap-1.4.0'
        },
        baseUrl: 'assets'
    });

    console.log("[app][require] Requiring base application modules");

    require(['require', 'log', 'db', 'app', 'core', 'utils', 'ui', 'collection', 'phonegap'],
        function( require, log ) {
        
        var logger = log.getLogger("app");

        logger.info("Loading app.js");

        $.mobile = $.mobile || {};

        logger.info("Setup of 'deviceready' event");
        document.addEventListener("deviceready", function() {
            logger.info("[event][deviceready]");
        }, true);

        logger.info("Setup of 'mobileinit' event");
        $(document).bind("mobileinit", function() {

            logger.info("[mobileinit] Event handled");

            $.mobile.defaultPageTransition = 'fade';

            $.mobile.jqmRouter = $.mobile.jqmRouter || {};
            $.mobile.jqmRouter.fixFirstPageDataUrl = true;
            $.mobile.jqmRouter.firstPageDataUrl = "index.html";

            logger.info("Show body");
            $('body').show();
        });

        logger.info("Loading jqmr, jqm, phonegap and router");
        require(['require', 'order!jqmr', 'order!jqm', 'order!router'], function(require) {
            logger.info("Loading ...");
        });
    });

};

setTimeout(init, WAIT_TIME);
