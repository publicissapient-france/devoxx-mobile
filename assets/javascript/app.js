(function( $, Lawnchair ) {

    console.log("[app] Loading app.js");

    $.mobile = $.mobile || {};

    var app = window.app = $.extend({
        views: {}
    }, window.app || {});

    document.addEventListener("deviceready", function() {
        console.log("[app][event] deviceready");
    }, true);

    $(document).bind("mobileinit", function() {

        console.log("[app][event] mobileinit");

        $.mobile.defaultPageTransition = 'fade';

        $.mobile.jqmRouter = $.mobile.jqmRouter || {};
        $.mobile.jqmRouter.fixFirstPageDataUrl = true;
        $.mobile.jqmRouter.firstPageDataUrl = "index.html";

        app.onMobileInit();

        console.log("[app] Show body");
        $('body').show();
    });


        var core = app.core = {};

        // ******************************************************************************
        // * Constants
        // ******************************************************************************

        // ******************************************************************************
        // * Global variables
        // ******************************************************************************

        var dbName = "xebia";

        var options;

        var DEFAULT_OPTIONS = {
            cacheData: false
        };


        // ******************************************************************************
        // * Events
        // ******************************************************************************

        app.onMobileInit = function() {
            console.log("[core] Loading on mobile init");

            app.db = new Lawnchair({name: dbName}, function(db) {
                console.log("[core] Storage open for db: '" + db.name + "' with '" + db.adapter + "' adapter.");
            });

            options = app.db.get("options", function(options) {
                if (!options) {
                    options = DEFAULT_OPTIONS;
                    app.db.save({ key: "options", value: options });
                }
            });
        };


}) ( jQuery, Lawnchair );
