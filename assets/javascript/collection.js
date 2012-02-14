(function( app ) {

    console.log("[collection] Loading collection.js");

    var collectionModel = app.collectionModel = {
        views: {}
    };

    collectionModel.EntryModel = Backbone.Model.extend({});

    collectionModel.EntryCollection = Backbone.Collection.extend({
        model: collectionModel.EntryModel,
        initialize: function(models, options) {
            console.log("[collection] Initializing Entry Collection");
            this.url = options.url;
            this.parse = function(data) {
                if (options.beforeParse) {
                    options.beforeParse(data);
                }
                return options.parse ? options.parse(data) : data;
            };
            this.sync = options.sync;
        }
    });

    collectionModel.EntryListView = Backbone.View.extend({
        initialize: function() {
            console.log("[collection] Initializing Entry List View");
            this.el = $(this.options.el);
            this.collection = new collectionModel.EntryCollection([], {
                url: this.options.fetchUrl,
                parse: this.options.parse,
                sync: this.options.sync,
                beforeParse: this.options.beforeParse
            });
            this.collection.bind('reset', this.render, this);
            this.collection.bind('add', this.add, this);
        },

        render: function() {
            console.log("[collection] Rendering List View");
            var el = $(this.options.el);
            el.empty();
            var content = _.template( this.options.collectionTemplate, { entries: this.collection.models } );
            el.html(content);
            el.listview("[collection] refresh");

            return this;
        }

    });

}) ( app );
