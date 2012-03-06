define(['log'], function (log) {

    var logger = log.getLogger('analytics');

    logger.info("Loading db.js");

    var analytics = { };

    var _gaq = _gaq || [];

    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);

    analytics.setupListener = function() {
        $('[data-role=page]').live('pageshow', function (event, ui) {
            if (!OFFLINE) {
                try {
                    _gaq.push(['_setAccount', 'UA-1889791-16']);

                    var hash = location.hash;

                    if (hash) {
                        var hashToPush = hash.substr(1);
                        logger.info("Pushing page to analytics: '" + hashToPush + "'");
                        _gaq.push(['_trackPageview', hashToPush]);
                    } else {
                        _gaq.push(['_trackPageview']);
                    }
                } catch(err) {
                    logger.info("Error catched: " + err.name + " - " + err.message);
                }
            }
        });
    };

    logger.info("Loaded analytics");

    return analytics;

});
