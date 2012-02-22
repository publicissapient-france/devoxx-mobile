define(['log', 'db'], function( log, db ) {

    var logger = log.getLogger('register');

    logger.info("Loading register.js");

    var REGISTERED = "registered";

    logger.info("Defining register object");

    var register = {};

    logger.info("Loaded register");

    register.onSuccess = function(data, status) {
        console.log("Registration submitted");
        $("#contest-form-submitted-notification").show();
        db.save(REGISTERED, 'true');
    };

    register.onError = function(data, status) {
        console.log("Registration error");
    };

    register.beforePageShow = function() {
        $("#contest-form-submitted-notification").hide();
        $("#contest-form-already-submitted-notification").hide();
        db.isEquals(REGISTERED, 'true', register.isAlreadyRegisteredCallback, register.isNotYetRegisteredCallback);
    };

    register.isAlreadyRegisteredCallback = function() {
        $("#contest-form-already-submitted-notification").show();
        $("#register-form").hide();
        $("#register-submit").unbind('click');
    };

     register.isNotYetRegisteredCallback = function() {
         $("#register-form").show();
         $("#register-submit").bind('click', register.onSubmit);
     };

    register.onSubmit = function() {

        var formData = $("#register-form").serialize();

        $.ajax({
            type: "POST",
            url: "http://devoxx-xebia.dotcloud.com/register",
            cache: false,
            data: formData,
            crossDomain: true,
            dataType: 'jsonp',
            success: register.onSuccess,
            error: register.onError
        });

        return false;
    };

    return register;

});
