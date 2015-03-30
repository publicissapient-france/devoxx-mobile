/*
 * jQueryMobile-router v0.6
 * http://github.com/azicchetti/jquerymobile-router
 *
 * Copyright 2011 (c) Andrea Zicchetti
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://github.com/azicchetti/jquerymobile-router/blob/master/MIT-LICENSE.txt
 * http://github.com/azicchetti/jquerymobile-router/blob/master/GPL-LICENSE.txt
 */

(function(e){console.log("[jqmr] Loading jqmr.js"),e(document).bind("mobileinit",function(){function r(e){n&&console.log("[jqmr][err] "+e)}console.log("[jqmr][mobileinit] Event handled");var t=e.extend({fixFirstPageDataUrl:!1,firstPageDataUrl:"index.html",ajaxApp:!1},e.mobile.jqmRouter||{}),n=!0,i=null,s=null;e(document).bind("pagebeforechange",function(t,n){if(typeof n.toPage=="string"){var r=e.mobile.path.parseUrl(n.toPage),o=i;i=s,s=r;if(r.hash.indexOf("?")!==-1){var u=r.hash.replace(/\?.*$/,"");n.options.dataUrl=r.href,e.mobile.activePage&&u.replace(/^#/,"")==e.mobile.activePage.jqmData("url")&&(!i||!o||i.hash!=o.hash&&i.hash.replace(/\?.*$/,"")==o.hash.replace(/\?.*$/,""))?(n.options.allowSamePageTransition=!0,e.mobile.changePage(e(u),n.options)):e.mobile.changePage(e(u),n.options),t.preventDefault()}}}),t.fixFirstPageDataUrl&&e(document).ready(function(){if(!window.location.pathname.match("/$"))return;var n=e(":jqmData(role='page')").first(),r=n.jqmData("url"),i=window.location.pathname+t.firstPageDataUrl+window.location.search+window.location.hash;r!=i&&n.attr("data-url",i).jqmData("url",i)}),e.mobile.Router=function(n,r,i){console.log("[jqmr]"+this),this.routes={pagebeforecreate:null,pagecreate:null,pagebeforeshow:null,pageshow:null,pagebeforehide:null,pagehide:null,pageinit:null,pageremove:null},this.evtLookup={bc:"pagebeforecreate",c:"pagecreate",bs:"pagebeforeshow",s:"pageshow",bh:"pagebeforehide",h:"pagehide",i:"pageinit",rm:"pageremove"},this.routesRex={},this.conf=e.extend({},t,i||{}),this.defaultHandlerEvents={};if(this.conf.defaultHandlerEvents){var s=this.conf.defaultHandlerEvents.split(",");for(var o=0;o<s.length;o++)this.defaultHandlerEvents[this.evtLookup[s[o]]]=s[o]}this.add(n,r)},e.extend(e.mobile.Router.prototype,{add:function(t,n){if(!t)return;var i=this,s=[];t instanceof Array?e.each(t,e.proxy(function(e,t){this.add(t,n)},this)):(e.each(t,function(e,t){if(typeof t=="string"||typeof t=="function")i.routes.pagebeforeshow===null&&(i.routes.pagebeforeshow={}),i.routes.pagebeforeshow[e]=t,i.routesRex.hasOwnProperty(e)||(i.routesRex[e]=new RegExp(e));else{var n,s=t.events.split(","),o;for(n=0;n<s.length;n++)o=i.evtLookup[s[n]],i.routes.hasOwnProperty(o)?(i.routes[o]===null&&(i.routes[o]={}),i.routes[o][e]=t.handler,i.routesRex.hasOwnProperty(e)||(i.routesRex[e]=new RegExp(e))):r("can't set unsupported route "+s[n])}}),e.each(i.routes,function(e,t){t!==null&&s.push(e)}),this.userHandlers||(this.userHandlers={}),e.extend(this.userHandlers,n||{}),this._detachEvents(),s.length>0&&(this._liveData={events:s.join(" "),handler:function(e,t){i._processRoutes(e,t,this)}},e(":jqmData(role='page'),:jqmData(role='dialog')").live(this._liveData.events,this._liveData.handler)))},_processRoutes:function(t,n,o){var u=this,a,f,l,c=0;t.type in{pagebeforehide:!0,pagehide:!0,pageremove:!0}?a=i:a=s;do{if(!a)o&&(l=e(o),a=l.jqmData("url"),a&&(l.attr("id")==a&&(a="#"+a),a=e.mobile.path.parseUrl(a)));else if(o&&!e(o).jqmData("url"))return;if(!a)return;f=this.conf.ajaxApp?a.pathname+a.search+a.hash:a.hash,f.length==0&&(a=""),c++}while(f.length==0&&c<=1);var h=!1;e.each(this.routes[t.type],function(e,i){var s,a;if(s=f.match(u.routesRex[e])){typeof i=="function"?a=i:typeof u.userHandlers[i]=="function"&&(a=u.userHandlers[i]);if(a)try{a(t.type,s,n,o,t),h=!0}catch(l){r(l)}}});if(!h&&this.conf.defaultHandler&&this.defaultHandlerEvents[t.type]&&typeof this.conf.defaultHandler=="function")try{this.conf.defaultHandler(t.type,n,o,t)}catch(p){r(p)}},_detachEvents:function(){this._liveData&&e(":jqmData(role='page'),:jqmData(role='dialog')").die(this._liveData.events,this._liveData.handler)},destroy:function(){this._detachEvents(),this.routes=this.routesRex=null},getParams:function(t){if(!t)return null;var n={},r,i=t.slice(t.indexOf("?")+1).split("&");return e.each(i,function(e,t){r=t.split("="),n[r[0]]?(n[r[0]]instanceof Array||(n[r[0]]=[n[r[0]]]),n[r[0]].push(r[1])):n[r[0]]=r[1]}),e.isEmptyObject(n)?null:n}})})})(jQuery);