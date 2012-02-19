define(['log'], function( log ) {

    var logger = log.getLogger('entry');

    logger.info("Loading entry.js");

    logger.info("Defining entry object");
    var entry = {
        views: {}
    };


    logger.info("Defining Model");
    entry.EntryModel = Backbone.Model.extend({
        initialize: function(options) {
            logger.info("Initializing Entry");
            this.url = options.url;
            this.parse = function(data) {
                if (options.beforeParse) {
                    options.beforeParse(data);
                }
                return options.parse ? options.parse(data) : data;
            };
        }
    });

    logger.info("Defining view");
    entry.EntryView = Backbone.View.extend({
        initialize: function() {
            logger.info("Initializing Entry View");
            this.el = $(this.options.el);
            this.entry = new entry.EntryModel({
                url: this.options.fetchUrl,
                parse: this.options.parse,
                beforeParse: this.options.beforeParse
            });
            this.entry.bind('change', this.render, this);
        },

        render: function() {
            logger.info("Rendering Entry View");
            var el = $(this.options.el);
            el.empty();
            var content = _.template( this.options.entryTemplate, { entry: this.entry } );
            el.html(content);
            this.options.postRender(this.entry);

            return this;
        }

    });
    
    logger.info("Loaded entry");

    return entry;

});
