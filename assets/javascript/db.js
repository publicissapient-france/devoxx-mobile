define(['log'], function( log ) {

    var logger = log.getLogger('db');

    logger.info("Loading db.js");

    var DB_NAME = "xebia";

    var DEFAULT_OPTIONS = {
        cacheData: false
    };


    logger.info("Creating Lawnchair object");

    var lawnchair = new Lawnchair({name: DB_NAME}, function(database) {
        logger.info("Storage open for db: '" + database.name + "' with '" + database.adapter + "' adapter.");
    });

    logger.info("Created Lawnchair object");

    var db = {};

    db.getName = function() {
        return DB_NAME;
    };

    db.getOptions = function() {
        return $.extend(DEFAULT_OPTIONS);
    };

    db._init = function() {
        logger.info("Verifying options");

        lawnchair.get("options", function(options) {
            if (!options) {
                logger.info("No options");
                options = DEFAULT_OPTIONS;
                logger.info("Saving options");
                lawnchair.save({ key: "options", value: options });
            }
        });

        logger.info("Ended init collection");
    };

    db._init();

    logger.info("Loaded db");

    return db;
});

