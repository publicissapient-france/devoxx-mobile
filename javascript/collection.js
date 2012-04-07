define(['log', 'ui'], function( log, ui ) {

    var logger = log.getLogger('collection');

    logger.info("Loading collection.js");

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
            this.dataType = options.dataType;
            this.url = options.url;
            this.parse = function(data) {
                return options.parse ? options.parse(data) : data;
            };
        }
    });

    logger.info("Defining view");
    collection.EntryListView = Backbone.View.extend({
        initialize: function() {
            logger.info("Initializing Entry List View");
            this.el = $(this.options.el);
            this.collection = new collection.EntryCollection([], {
                dataType: this.options.dataType,
                url: this.options.fetchUrl,
                parse: this.options.parse
            });
            this.collection.bind('reset', this.render, this);
        },

        render: function() {
            logger.info("Rendering List View");
            var el = $(this.options.el);
            var content = _.template( this.options.collectionTemplate, { entries: this.collection.models, view: this.options.view } );
            el.html(content);
            el.listview("refresh");

            if (this.options.postRender) {
                this.options.postRender(this.collection.models);
            }

            return this;
        }

    });
    
    logger.info("Loaded collection");

    return collection;

});
