define(["log","ui"],function(a,b){var c=a.getLogger("analytics");c.info("Loading analytics.js"),b.updateSplashscreenMessage("Chargements module Statistiques");var d={};return d.setupListener=function(){$("[data-role=page]").live("pageshow",function(a,b){if(!OFFLINE)try{window._gaq.push(["_setAccount","UA-1889791-16"]);var d=location.hash;if(d){var e=d.substr(1);c.info("Pushing page to analytics: '"+e+"'"),window._gaq.push(["_trackPageview",e])}else window._gaq.push(["_trackPageview"])}catch(f){c.info("Error catched: "+f.name+" - "+f.message)}})},c.info("Loaded analytics"),d})