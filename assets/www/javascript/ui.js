define(['log'], function( log ) {

    var logger = log.getLogger('ui');

    logger.info("Loading ui.js");

    var ui =  { };

    ui.showFlashMessage = function(options) {
        var flashMessage = _.template($('#flash-message-tpl').html(), { message: "Please, wait while loading ..." } );
        var currentPageHeader = $(options.page).children(":jqmData(role='header')");
        currentPageHeader.append(flashMessage);
    };

    ui.hideFlashMessage = function(options) {
        var header = $(options.page).children(":jqmData(role='header')");
        var flashMessage = header.children("div#flashMessage");
        var flashMessageContent = flashMessage.children("h1");
        flashMessageContent.fadeOut();
        setInterval(function () {
            flashMessage.remove();
        }, 500);
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
