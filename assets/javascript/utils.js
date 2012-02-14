(function( app ) {

    console.log("[utils] Loading utils.js");

    var utils = app.utils = {};

    var JSON_API_BASE_URL = 'http://localhost';
//    var JSON_API_BASE_URL = 'http://blog.xebia.fr';

    var logContent = new Array();


    utils.getJsonApiBaseUrl = function() {
        return JSON_API_BASE_URL;
    };

    utils.getLogContent = function() {
        return logContent;
    };

    utils.info = function(log) {
        console.log(log);
        if (logContent.length > 1000) {
            logContent.shift();
        }
        logContent.push(log);
    };

    utils.saveDataToDb = function(dbKey, data) {
        var start = new Date();
        console.log("[utils] Saving Json " + dbKey + " content: " + utils.showInterval(start));
        utils.db.save({ key: dbKey, value: data });
        console.log("[utils] Saved Json " + dbKey + " content: " + utils.showInterval(start));
    };

    utils.loadFromUrl = function(dbKey, url, onSuccess) {
        var start = new Date();
        console.log("[utils] Start loading " + dbKey + " content: " + utils.showInterval(start) );
        $.when($.ajax(url, { dataType: "json" })).then(function(data) {
            console.log("[utils] Loaded Json " + dbKey + " content: " + utils.showInterval(start));
            onSuccess(data);
        });
    };

    utils.linkify = function(inputText) {
        //URLs starting with http://, https://, or ftp://
        var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        var replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

        //URLs starting with www. (without // before it, or it'd re-link the ones done above)
        var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

        //Change email addresses to mailto:: links
        var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

        return replacedText;
    };

    utils.decodeHtmlEntities = function(encodedContent) {
        return $("<div/>").html(encodedContent).text();
    };

    utils.stripTags = function(content) {

        var result = content.replace(/(<([^>]+)>)/ig,"").replace(/\r\n/g, '<br>').replace(/\r/g, '<br>').replace(/\n/g, '<br>');

        return utils.linkify(result);
    };

    utils.getParameterByName = function( name ) {
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regex = new RegExp( "[\\?&]" + name + "=([^&#]*)" );
        var results = regex.exec( window.location.href );
        if( results == null ) {
            return "";
        }
        else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    };

    utils.showInterval = function(start) {
        var duration = new Date(new Date() - start + start.getTimezoneOffset() * 60000);
        var formattedDuration = duration.toString("HH:mm:ss");
        return formattedDuration + "." + duration.getMilliseconds();
    };

    utils.getFullUrl = function(relativeUrl) {
        return JSON_API_BASE_URL + "/?" + relativeUrl;
    };



    //    utils.loadContent = function(element, cacheKey, url, itemsContentBuilder, dataAccessor, options) {
    //        $.mobile.showPageLoadingMsg();
    //
    //        var start = new Date();
    //
    //        var onContentLoaded = function() {
    //            console.log("[utils] Content loaded: " + utils.showInterval(start));
    //            $.mobile.hidePageLoadingMsg();
    //        };
    //
    //        var onDataLoadedFromUrl = function(data) {
    //            if (options.cacheData) {
    //                utils.saveDataToDb(cacheKey, data);
    //            }
    //            onDataLoadedFromDb(data);
    //        };
    //
    //        var onDataLoadedFromDb = function(data) {
    //            utils.updateListUI(dataAccessor(data), element, onContentLoaded, itemsContentBuilder);
    //        };
    //
    //        var onLoadDataFromUrl = function() {
    //            utils.loadFromUrl(cacheKey, url, onDataLoadedFromUrl);
    //        };
    //
    //        if (options.cacheData) {
    //            utils.db.get(cacheKey, function(data) {
    //                if (data) {
    //                    onDataLoadedFromDb(data);
    //                }
    //                else {
    //                    onLoadDataFromUrl();
    //                }
    //            });
    //        }
    //        else {
    //            onLoadDataFromUrl();
    //        }
    //    };

}) ( app );




