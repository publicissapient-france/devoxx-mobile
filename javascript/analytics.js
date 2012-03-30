define(['log', 'ui'], function (log, ui) {

    var logger = log.getLogger('analytics');

    logger.info("Loading analytics.js");

    var analytics = { };

    analytics.setupListener = function() {
        $('[data-role=page]').live('pageshow', function (event, ui) {
            if (!OFFLINE) {
                try {
                    window._gaq.push(['_setAccount', 'UA-1889791-17']);

                    var hash = location.hash;

                    if (hash) {
                        var hashToPush = hash.substr(1);
                        logger.info("Pushing page to analytics: '" + hashToPush + "'");
                        window._gaq.push(['_trackPageview', hashToPush]);
                    } else {
                        window._gaq.push(['_trackPageview']);
                    }
                } catch(err) {
                    logger.info("Error catched: " + err.name + " - " + err.message);
                }
            }
        });
    };

//var _gaq = _gaq || [];
//
//$(document).ready(function(e) {
//	(function() {
//	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//	  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') +
//                 '.google-analytics.com/ga.js';
//	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
//	})();
//   });
//
//$('[data-role=page]').live('pageshow', function (event, ui) {
//	try {
//		_gaq.push(['_setAccount', 'YOUR_ANALYTICS_ID_GOES_HERE']);
//
//		if ($.mobile.activePage.attr("data-url")) {
//			_gaq.push(['_trackPageview', $.mobile.activePage.attr("data-url")]);
//		} else {
//			_gaq.push(['_trackPageview']);
//		}
//	} catch(err) {}
//
//});

    logger.info("Loaded analytics");

    return analytics;

});
