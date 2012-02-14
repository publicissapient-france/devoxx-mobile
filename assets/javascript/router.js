(function( app, $ ) {

    console.log("[router] Loading router.js");

    var router = app.router = {};
    var utils = app.utils;
    var collectionModel = app.collectionModel;

    router = new $.mobile.Router({
        "#slots" : { handler : "onBeforeSlotsPageShow", events: "bs" }
    },
    {
        onBeforeSlotsPageShow: function(type, match, ui) {
            router.refreshSlots();
        }
    });

    router.onFetchSuccess = function(model, resp, options) {
        setInterval(function() {
            $.mobile.hidePageLoadingMsg();
            router.hideFlashMessage(options);
        }, 0);
    };

    router.onFetchError = function(originalModel, resp, errOptions, options) {
        setInterval(function() {
            console.log("Error response tmp: '" + resp + "' for url: '" + options.fetchUrl + "'");
            $.mobile.hidePageLoadingMsg();
            router.hideFlashMessage(options);
        }, 0);
    };

    router.getParams = function(hashparams){
        if (!hashparams) return null;
        var params={}, tmp;
        var tokens=hashparams.slice( hashparams.indexOf('?')+1 ).split("&");
        $.each(tokens,function(k,v){
            tmp=v.split("=");
            if (params[tmp[0]]){
                if (!(params[tmp[0]] instanceof Array)){
                    params[tmp[0]]=[ params[tmp[0]] ];
                }
                params[tmp[0]].push(tmp[1]);
            } else {
                params[tmp[0]]=tmp[1];
            }
        });
        if ($.isEmptyObject(params)) return null;
        return params;
    };

    router.refreshDataList = function(options) {
        $.mobile.showPageLoadingMsg();
        console.log("Show " + options.title + " page message!");
        router.showFlashMessage(options);

        console.log("Loading " + options.title + " View");
        collectionModel.views[options.view] = new collectionModel.EntryListView({
            fetchUrl: options.url,
            el: options.el,
            collectionTemplate: options.template,
            parse: options.parse,
            sync: router.sync,
            beforeParse: options.beforeParse
        });

        if (collectionModel.views[options.view].collection.length !== 0) {
            collectionModel.views[options.view].collection.reset([]);
        }

        console.log("Fetch " + options.title + " Data from url: '" + collectionModel.views[options.view].collection.url + "'");
        collectionModel.views[options.view].collection.fetch({
            success: function(model, resp) {
                if (options.success) {
                    options.success(model, resp);
                }
                router.onFetchSuccess(model, resp, options);
            } ,
            error: function (originalModel, resp, errOptions) { router.onFetchError(originalModel, resp, errOptions, options) },
            fetchUrl: options.url
        });
    };

    router.refreshSlots = function() {
        router.refreshDataList({
            page: "#slots", title: "Slots", el: "#slot-list", view: "slots", template: $("#slots-list-tpl").html(),
            url: utils.getFullUrl('json=get_slot_index&callback=?'),
            parse: function(data) { return data.slots; }
        });
    };

} ) ( app, jQuery );
