define(['log', 'db', 'ui'], function( log, db, ui ) {

    var logger = log.getLogger('register');

    logger.info("Loading register.js");
    ui.updateSplashscreenMessage("Chargement du module d'enregistrement");

    var REGISTERED = "registered";

    logger.info("Defining register object");

    var register = {};

    logger.info("Loaded register");

    $("#register-form").bind('invalid', function(e){
        ui.showFlashMessage( { page: '#register', message: 'Vous devez renseigner les champs obligatoires pour valider le formulaire!' } );
        $.mobile.silentScroll(0);
    	e.preventDefault();
    });

    register.supportsValidity = function() {
      var i = document.createElement('input');
      return typeof i.validity === 'object';
    };

    register.onSuccess = function(data, status) {
        console.log("Registration submitted");
        ui.resetFlashMessages("#register");
        ui.showFlashMessage( { page: '#register', message: 'Enregistrement soumis avec succès!' } );
        $("#register-form").hide();
        $.mobile.silentScroll(0);
        db.exists(REGISTERED, function(exists) {
            if (!exists) {
                db.save(REGISTERED, 'true');
            }
        });
    };

    register.onError = function(data, status) {
        ui.showFlashMessage( { page: '#register', type: 'error', message: 'Erreur lors de l\'enregistrement, merci de réessayer plus tard !' } );
        console.log("Registration error");
    };

    register.beforePageShow = function() {
        ui.resetFlashMessages("#register");
        db.isEquals(REGISTERED, 'true', register.isAlreadyRegisteredCallback, register.isNotYetRegisteredCallback);
    };

    register.isAlreadyRegisteredCallback = function() {
        ui.showFlashMessage( { page: '#register', type: 'error', message: 'Enregistrement déjà soumis!' } );
        $("#register-submit").unbind('click');
        $("#register-form").hide();
    };

     register.isNotYetRegisteredCallback = function() {
         $("#register-form").show();
         $("#register-submit").bind('click', register.onSubmit);
     };

    register.onSubmit = function() {
        var formData = $("#register-form").serialize();

        if ( !register.supportsValidity() || $("#register-form")[0].checkValidity() ) {
            $.ajax({
                type: "POST",
                url: "http://devoxx-xebia.cloudfoundry.com/register",
                cache: false,
                data: formData,
                crossDomain: true,
                success: register.onSuccess,
                error: register.onError
            });
        }

        return false;
    };

    return register;

});
