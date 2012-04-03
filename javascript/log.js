define([], function( ) {

    console.log("[log] Loading log.js");

    var INFO = "INFO";

    var log = { };

    var logContent = new Array();

    log.getLogContent = function() {
        return logContent;
    };

    log.getLogger = function(module) {
        return {
            info: function(content) {
                var date = new Date().toString("HH:mm:ss");
                var log = "[" + date + "][" + INFO + "][" + module + "] " + content;

                if( console && console.log ) {
                    console.log(log);
                }
                if (logContent.length > 1000) {
                    logContent.shift();
                }

                logContent.push(log);
            }
        };
    };

    if( console && console.log ) {
        console.log("[log] Loaded log.js");
    }

    return log;

});




