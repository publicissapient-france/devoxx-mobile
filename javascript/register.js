define(["log","db","ui"],function(a,b,c){var d=a.getLogger("register");d.info("Loading register.js"),c.updateSplashscreenMessage("Chargement module concours");var e="registered";d.info("Defining register object");var f={};return d.info("Loaded register"),$("#register-form").bind("invalid",function(a){c.showFlashMessage({page:"#register",message:"Vous devez renseigner les champs obligatoires pour valider le formulaire!"}),$.mobile.silentScroll(0),a.preventDefault()}),f.supportsValidity=function(){var a=document.createElement("input");return typeof a.validity=="object"},f.onSuccess=function(a,d){console.log("Registration submitted"),c.resetFlashMessages("#register"),c.showFlashMessage({page:"#register",message:"Enregistrement soumis avec succès!"}),$("#register-form").hide(),$.mobile.silentScroll(0),b.exists(e,function(a){a||b.save(e,"true")})},f.onError=function(a,b){c.showFlashMessage({page:"#register",type:"error",message:"Erreur lors de l'enregistrement, merci de réessayer plus tard !"}),console.log("Registration error")},f.beforePageShow=function(){c.resetFlashMessages("#register"),b.isEquals(e,"true",f.isAlreadyRegisteredCallback,f.isNotYetRegisteredCallback)},f.isAlreadyRegisteredCallback=function(){c.showFlashMessage({page:"#register",type:"error",message:"Enregistrement déjà soumis!"}),$("#register-submit").unbind("click"),$("#register-form").hide()},f.isNotYetRegisteredCallback=function(){$("#register-form").show(),$("#register-submit").bind("click",f.onSubmit)},f.onSubmit=function(){var a=$("#register-form").serialize();return(!f.supportsValidity()||$("#register-form")[0].checkValidity())&&$.ajax({type:"POST",url:"http://devoxx-xebia.cloudfoundry.com/register",cache:!1,data:a,crossDomain:!0,success:f.onSuccess,error:f.onError}),!1},f})