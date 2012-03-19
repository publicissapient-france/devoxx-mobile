var DEFAULT_DEBUG_MODE = false;
var DEBUG = DEFAULT_DEBUG_MODE || getLocationParameterByName('debug') === 'true';
var SAFE = true;
var OFFLINE = false;
var PROXY = true;
var DB_NUKE = true;

var WAIT_TIME = DEBUG ? 0 : 0;
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

function init() {
    console.log("[app][init] Initializing require");

    console.log("[app][init][require] Setting config");

    require.config({
        paths: {
            'text':        'lib/require/require.text-1.0.2' + ( DEBUG ? '.min' : ''),
            'order':       'lib/require/require.order-1.0.5.min',
            'core':        'core',
            'utils':       'utils',
            'ui':          'ui',
            'db':          'db',
            'log':         'log',
            'collection':  'collection',
            'entry':       'entry',
            'register':    'register',
            'analytics':   'analytics',
            'jquery':      'lib/jquery/jquery-1.7.1',
            'underscore':  'lib/underscore/underscore-1.3.1',
            'backbone':    'lib/backbone/backbone-0.9.1',
            'jqmr':        'lib/jquerymobile/jquery.mobile.router-0.6',
            'jqm':         'lib/jquerymobile/jquery.mobile-1.1.0-rc.1'
        },
        baseUrl: 'javascript'
    });

    console.log("[app][require] Requiring base application modules");

    require (['require', 'order!jquery', 'order!underscore', 'order!backbone'], function(require, $, _, Backbone) {

        window.$ = $;
        window._ = _;
        window.Backbone = Backbone;
        window.app = window.app || {};

        require(['require', 'order!log', 'order!analytics', 'order!jqmr', 'order!core', 'db', 'utils', 'ui', 'collection', 'entry', 'register' ],
            function( require, log, analytics, jqmr, core, db, utils, ui ) {

            window.app.core = core;
            window.app.ui = ui;
            window.app.utils = utils;

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

                $.mobile.defaultPageTransition = 'none';

                $.mobile.jqmRouter = $.mobile.jqmRouter || {};
                $.mobile.jqmRouter.fixFirstPageDataUrl = true;
                $.mobile.jqmRouter.firstPageDataUrl = "index.html";

                core.setupRouter();

                logger.info("Show body");
                if (SAFE) {
                    $('#splash-screen').hide();
                    $('body').show();
                    $('#pages').show();
                }

                analytics.setupListener();
            });

            logger.info("Loading jqmr, jqm, phonegap and core");

            require(['require', 'order!jqm'], function(require, jqm) {
                logger.info("Loading ...");
            });
        });

    }) ;

}

function getLocationParameterByName( name ) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp( "[\\?&]" + name + "=([^&#]*)" );
    var results = regex.exec( window.location.href );
    if( results == null ) {
        return "";
    }
    else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

setTimeout(init, WAIT_TIME);

// ref: http://diveintohtml5.org/detect.html
function supports_input_placeholder() {
  var i = document.createElement('input');
  return 'placeholder' in i;
}

if(!supports_input_placeholder()) {
  var fields = document.getElementsByTagName('INPUT');
  for(var i=0; i < fields.length; i++) {
    if(fields[i].hasAttribute('placeholder')) {
      fields[i].defaultValue = fields[i].getAttribute('placeholder');
      fields[i].onfocus = function() { if(this.value == this.defaultValue) this.value = ''; }
      fields[i].onblur = function() { if(this.value == '') this.value = this.defaultValue; }
    }
  }
}