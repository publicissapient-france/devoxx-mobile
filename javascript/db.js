define(['log', 'ui'], function( log, ui ) {

    var logger = log.getLogger('db');

    logger.info("Loading db.js");
    ui.updateSplashscreenMessage("Chargement module database");

    var db = { };

    var DB_NAME = "xebia";

    logger.info("Creating Lawnchair object");

    var lawnchair = new Lawnchair({name: DB_NAME}, function(database) {
        logger.info("Storage open for db: '" + database.name + "' with '" + database.adapter + "' adapter.");

        if (DB_NUKE) {
            var self = this;
            self.keys({}, function(keys) {
                _(keys).each(function(key) {
                    if (key.indexOf("/events/") >= 0) {
                        self.remove(key, function() {
                            logger.info("Destroyed following key in db: '" + key + "'");
                        });
                    }
                });
            });
        }
    });

    logger.info("Created Lawnchair object");

    db.exists = function(key, callback) {
        lawnchair.get(key, function(exists) {
            callback(exists);
        });
    };

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
            (actualValue && (actualValue.value === expectedValue)) ? trueCallBack() : falseCallback();
        });
    };

    db.getOrFetch = function(key, getCallBack, fetchCallback) {
        lawnchair.get(key, function(data) {
            data ? getCallBack(data.value) : fetchCallback();
        });
    };

    logger.info("Loaded db");

    return db;

});

