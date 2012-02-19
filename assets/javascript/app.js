var DEBUG = false;
var SAFE = true;
var OFFLINE = false;
var PROXY = true;

var WAIT_TIME = DEBUG ? 3000 : 0;
var DEBUG_JSON_CALLBACK = "onJsonLoad";

console.log("DEBUG: " + DEBUG);
console.log("SAFE: " + SAFE);
console.log("OFFLINE: " + OFFLINE);
console.log("WAIT_TIME: " + WAIT_TIME);
console.log("DEBUG_JSON_CALLBACK: " + DEBUG_JSON_CALLBACK);
console.log("PROXY: " + PROXY);

if (DEBUG) {
    console.log("Waiting for " + WAIT_TIME + "ms before loading application");
}

if (!SAFE) {
    $("#logo").hide();
    $("#home-footer").hide();
    $("#version").hide();
    $("#home").css("background-image", "url(images/none.png)");
    document.title = "Dev/Debug mode";
}

var init = function() {
    console.log("[app][init] Initializing require");

    console.log("[app][init][require] Setting config");

    require.config({
        paths: {
            'text':        'javascript/lib/require/require.text-1.0.2',
            'order':       'javascript/lib/require/require.order-1.0.5',
            'core':      'javascript/core',
            'app':         'javascript/app',
            'utils':       'javascript/utils',
            'ui':          'javascript/ui',
            'db':          'javascript/db',
            'log':         'javascript/log',
            'collection':  'javascript/collection',
            'entry':       'javascript/entry',
            'jqmr':        'javascript/lib/jquerymobile/jquery.mobile.router-0.6',
            'jqm':         'javascript/lib/jquerymobile/jquery.mobile-1.0.1',
            'phonegap':    'javascript/lib/phonegap/phonegap-1.4.0'
        },
        baseUrl: 'assets'
    });

    console.log("[app][require] Requiring base application modules");

    require(['require', 'log', 'order!jqmr', 'order!core', 'db', 'app', 'utils', 'ui', 'collection', 'entry', 'phonegap' ],
        function( require, log, jqmr, core ) {
        
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

            core.init();

            logger.info("Show body");
            if (SAFE) {
                $('#splash-screen').hide();
                $('body').show();
            }
        });

        logger.info("Loading jqmr, jqm, phonegap and core");

        require(['require', 'order!jqm'], function(require, jqm) {
            logger.info("Loading ...");
        });
    });

};

setTimeout(init, WAIT_TIME);
