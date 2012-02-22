define(['log'], function( log ) {

    var logger = log.getLogger('db');

    logger.info("Loading db.js");

    var db = { };

    var DB_NAME = "xebia";

    logger.info("Creating Lawnchair object");

    var lawnchair = new Lawnchair({name: DB_NAME}, function(database) {
        logger.info("Storage open for db: '" + database.name + "' with '" + database.adapter + "' adapter.");
    });

    logger.info("Created Lawnchair object");

    db.getName = function() {
        return DB_NAME;
    };

    db.save = function(key, value) {
        lawnchair.save({key: key, value: value});
    };

    db.get = function(key, callback) {
        lawnchair.get(key, callback);
    };

    db.isEquals = function(key, expectedValue, trueCallBack, falseCallback) {
        lawnchair.get(key, function(actualValue) {
            actualValue === expectedValue ? trueCallBack() : falseCallback();
        });
    };

    logger.info("Loaded db");

    return db;

});

