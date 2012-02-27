define(['log'], function( log ) {

    var logger = log.getLogger('ui');

    logger.info("Loading ui.js");

    var ui =  { };

        ui.resetFlashMessages = function(page) {
            var header = $(page).children(":jqmData(role='header')");
            if (header) {
                var flashMessage = header.children("div#flashMessage");
                if (flashMessage) {
                    flashMessage.remove();
                }
                var flashErrorMessage = header.children("div#flashErrorMessage");
                 if (flashErrorMessage) {
                     flashErrorMessage.remove();
                 }
             }
        };

        ui.showFlashMessage = function(options) {
            if (options.page) {
                var flashMessage = _.template($('#flash' + (options.type === 'error' ? '-error' : '') + '-message-tpl').html(), { message: options.message ? options.message : "Please, wait while loading ..." } );
                var currentPageHeader = $(options.page).children(":jqmData(role='header')");
                currentPageHeader.append(flashMessage);
            }
        };

        ui.hideFlashMessage = function(options) {
            if (options.page) {
                var header = $(options.page).children(":jqmData(role='header')");
                var flashMessage = header.children("div#flash" + (options.type === 'error' ? 'Error' : '') + "Message");
                var flashMessageContent = flashMessage.children("h1");
                flashMessageContent.fadeOut();
                setInterval(function () {
                    flashMessage.remove();
                }, 500);
            }
        };

    // summary:
    //            Adjust the title of the current view
    //
    // title: String
    //            The title to update the view with
    ui.switchTitle = function( title ) {
        $( '.ui-title' ).text( title || "" );
    };

    logger.info("Loaded ui");

    return ui;
});
