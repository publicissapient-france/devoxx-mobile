define(['log', 'ui'], function( log, ui ) {

    var logger = log.getLogger('collection');

    logger.info("Loading collection.js");
    ui.updateSplashscreenMessage("Chargement du module de gestion des collections");


    logger.info("Defining collection object");
    var collection = {
        views: {}
    };

    logger.info("Defining Model");
    collection.EntryModel = Backbone.Model.extend({});

    logger.info("Defining collection");
    collection.EntryCollection = Backbone.Collection.extend({
        model: collection.EntryModel,
        initialize: function(models, options) {
            logger.info("Initializing Entry Collection");
            this.url = options.url;
            this.parse = function(data) {
                if (options.beforeParse) {
                    options.beforeParse(data);
                }
                var parsedData = options.parse ? options.parse(data) : data;
                if (options.afterParse) {
                    options.afterParse(parsedData);
                }
                return parsedData;
            };
        }
    });

    logger.info("Defining view");
    collection.EntryListView = Backbone.View.extend({
        initialize: function() {
            logger.info("Initializing Entry List View");
            this.el = $(this.options.el);
            this.collection = new collection.EntryCollection([], {
                url: this.options.fetchUrl,
                parse: this.options.parse,
                beforeParse: this.options.beforeParse,
                afterParse: this.options.afterParse
            });
            this.collection.bind('reset', this.render, this);
        },

        render: function() {
            logger.info("Rendering List View");
            var el = $(this.options.el);
            var content = _.template( this.options.collectionTemplate, { entries: this.collection.models } );
            el.html(content);
            el.listview("refresh");

            return this;
        }

    });
    
    logger.info("Loaded collection");

    return collection;

});
