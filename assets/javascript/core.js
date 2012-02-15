define(['log'], function( log ) {

    var logger = log.getLogger('core');

    logger.info("Loading core.js");

    var core = {};

    core.init = function() {
        logger.info("Init function");
    };

    logger.info("Loaded core");

    return core;

});