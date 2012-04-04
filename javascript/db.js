define(['log', 'ui'], function( log, ui ) {

    var logger = log.getLogger('db');

    logger.info("Loading db.js");

    var db = {
        cache: { }
    };

    var DB_NAME = "xebia";

    logger.info("Creating Lawnchair object");

    var lawnchair = new Lawnchair({name: DB_NAME}, function(database) {
        logger.info("Storage open for db: '" + database.name + "' with '" + database.adapter + "' adapter.");

        if (DB_NUKE) {
            var self = this;
            self.keys({}, function(keys) {
                _(keys).each(function(key) {
                    if (key.indexOf("/events/") >= 0 || key.indexOf("/xebia/") >= 0) {
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
        if (db.cache[key]) {
            setTimeout(function() {
                callback(true);
            }, 0);
        }
        lawnchair.get(key, function(exists) {
            callback(exists);
        });
    };

    db.getName = function() {
        return DB_NAME;
    };

    db.save = function(key, value) {
        db.cache[key] = value;
        lawnchair.save({key: key, value: value});
    };

    db.get = function(key, callback) {
        if (db.cache[key]) {
            setTimeout(function() {
                callback(db.cache[key]);
            }, 0);
        } else {
            lawnchair.get(key, function(data) {
                callback(data ? data.value : undefined);
            });
        }
    };

    db.isEquals = function(key, expectedValue, trueCallBack, falseCallback) {
        if (db.cache[key]) {
            setTimeout(function() {
                trueCallBack();
            }, 0);
        }
        else {
            lawnchair.get(key, function(actualValue) {
                (actualValue && (actualValue.value === expectedValue)) ? trueCallBack() : falseCallback();
            });
        }
    };

    db.getOrFetch = function(key, getCallBack, fetchCallback) {
        if (db.cache[key]) {
            setTimeout(function() {
                getCallBack(db.cache[key]);
            }, 0);
        }
        else {
            lawnchair.get(key, function(data) {
                data ? getCallBack(data.value) : fetchCallback();
            });
        }
    };

    logger.info("Loaded db");

    return db;

});

