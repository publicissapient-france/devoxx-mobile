(function( app ) {

    console.log("[ui] Loading ui.js");

    var ui = app.ui = {};

    ui.showFlashMessage = function(options) {
        var flashMessage = _.template($('#flash-message-tpl').html(), { flashMessage: "Please, wait while loading ..." } );
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

} ) ( app );
