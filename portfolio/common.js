/*****************************************************************************\
 *                                    *                                      *
 *  File:     common.js               *   Author:  oc (Ortwin Cars.)         *
 *                                    *                                      *
 *  Version:  0.3.2                   *   Date:    2013-11-20                *
 *                                    *                                      *
 *  Module:   global                  *   E-Mail:  ohc84@gmx-topmail.de      *
 *                                    *                                      *
 *  Project:  -                       *   Website: http://ortwin.qu.am       *
 *                                                                           *
 *  Description:  A collection of usefull utilities gathered by myself.      *
 *                                                                           *
\*****************************************************************************/

var oc = function() {
    var _removeIEBorders = false; // used for VE-HTML5 project (lots of nested iframes)
    
    // ====  Usefull Patterns  ================================================
    var Observerable = function() {
        var subscribers = {};        
        return {
            attach: function (obj, fn) { subscribers[obj+fn] = { src: obj, fn: fn }; },
            detach: function (obj, fn) { delete subscribers[obj+fn]; },    
            notify: function (args) { 
                for(var o in subscribers) { 
                    if(typeof args === "object") { args.target = subscribers[o].src; }
                    subscribers[o].fn.call(window, args);
                } 
            },
            count: function () { 
                var size = 0; 
                for(var o in subscribers) {
                    size++; 
                }
                return size; 
            }
        };
    }
    // ------------------------------------------------------------------------
    
    // ====  DOM-Helpers  =====================================================
    var DOM_modul = (function() {
        /**
         * Appends a bunch of properties to an object. Supports nested objects.
         * @param {object}  source object 
         * @param {object}  new object
         * @param {bool}    create new prop if not exists
         * @return {object} source object
         */
        function appendProps(obj, props, create) {
            for(var p in props) {
                if(create || p in obj) {
                    if(typeof props[p] == "object") {
                        appendProps(obj[p], props[p], create);
                    } else if(p.indexOf("on") == 0) { // && typeof props[p] == "function") {
                        // console.log(obj.tagName + ": " + p);
                        window.addEvent(obj, p.replace(/^on/, ""), props[p]);
                    } else {
                        obj[p] = props[p];
                    }
                }
            }
            return obj;
        }
        function appendStyle(src, props) { appendProps(src.style, props); }
        
        function getStyle(obj, prop) {
            if (obj.currentStyle)
                return obj.currentStyle[prop];
            else if (window.getComputedStyle) // https://developer.mozilla.org/en-US/docs/Web/API/window.getComputedStyle
                // return document.defaultView.getComputedStyle(obj, null).getPropertyValue(prop);
                return window.getComputedStyle(obj, null).getPropertyValue(prop);
        }
           
        /**
         * Creates a new DOM-Node.
         * @param {string}  tagName
         * @param {object}  object of node properties
         * @param {object}  parent node. 
         * @param {string}  text contents of node obj
         * @return {object} created node object
         */
        function newElement(name, props, base, text, self) {
            if(!base) base = document.getElementsByTagName("body")[0];
            if(!self) self = document.createElement(name);
            if(text) self.appendChild(document.createTextNode(text));
            if(typeof props === "object") {
                appendProps(self, props);
            } 
            base.appendChild(self);
            
            return self;
        }
        
        /**
         * Creates a new Div-Element.
         * @param {(object|string)}  object with css-styles or className
         * @param {object}  parent node. 
         * @param {string}  text contents of node obj
         * @return {object} created node object
         */
        function newDiv(styleOrClass, base, text, self) { 
            var props = {};
            props[typeof styleOrClass == "object" ? "style" : "className"] = styleOrClass;
            return newElement("div", props, base, text, self); 
        }
        
        // ---  misc stuff  ---------------------------------------------------   
        var loadScript = function(scriptname, doc) { 
            doc = doc || document;
            var node = doc.createElement('script');  
            node.setAttribute('type', 'text/javascript');  
            node.setAttribute('src', scriptname);  
            doc.getElementsByTagName('head')[0].appendChild(node);  
        };
        
        var loadCSS = function(scriptname, doc) {
            doc = doc || document;
            var node = doc.createElement('link');  
            node.setAttribute('type', 'text/css');  
            node.setAttribute('href', scriptname);  
            node.setAttribute('rel', 'stylesheet');  
            doc.getElementsByTagName('head')[0].appendChild(node);  
        };
        
        // --------------------------------------------------------------------
        return {
            createDiv: newDiv,
            createElement: newElement,
            appendProps: appendProps,
            appendStyle: appendStyle,
            getStyle: getStyle,
            loadScript: loadScript,
            loadCSS: loadCSS
        };
    })();
    // ------------------------------------------------------------------------
    
    // ====  location.search Helpers  =========================================
    var LSH_modul = (function() {
        var keys = [];
        var values = {};  // get properties from location.search
        function getProps(str, sep) {
            sep = sep || '&';
            var array = str.split(sep); // '?' entfernen
            
            for(var i = 0; i < array.length; ++i) {
                var eq = array[i].indexOf('=');
                keys[i] = array[i].substring(0, eq);
                values[keys[i]] = array[i].substring(eq + 1, array[i].length);
            }
            
            return values;
        }

        return {
            getProps: getProps,
            getPropsFromSearch: function(str, sep) { return getProps(str.substring(1,str.length), sep); },
            getKeysFromSearch: function() { if(values) return keys; }
        };
    })();
    // ------------------------------------------------------------------------
    
    // ====  Event handling  ==================================================   
    var XFC_modul = (function() {
        var mousePos = { source: window, clientX: 0, clientY: 0 }; 
        var events = {
            oninit: "init",
            onshow: "show",
            onhide: "hide",
            onregister: "register",
            onmousedown: "mousedown",
            onmousemove: "mousemove",
            onmouseup: "mouseup"
        };
        // handling popups and context menus
        function register(id, content) {
            parent.postMessage(events.onregister + ";" + id + ";" + content, "*"); 
        }
        
        function show(id, center) {
            center = !center ? mousePos.clientX + "," + mousePos.clientY : "";
            parent.postMessage(events.onshow + ";" + id + ";" + center, "*"); 
        }
        
        function hide(id) {
            parent.postMessage(events.onhide, "*"); 
        }
        
        function unregister(id) {
            parent.postMessage(events.onregister + ";" + id, "*"); 
        }
        
        return {
            MousePos: mousePos,
            Events: events, 
            registerObject: register,
            showObject: show,
            hideObject: hide,
            unregisterObject: unregister
        };
    })();
    // ------------------------------------------------------------------------
    
    var H_modul = (function() {        
        function traverseIFrames(fn) {
            if(typeof fn != "function") return;
            var ifs = document.getElementsByTagName("iframe");              
            for(var i = 0; i < ifs.length; ++i) {
                fn(ifs[i]);
            }
        }
        
        // probably deprecated, only used in VE-HTML5 project
        function removeIEBorder(iframe) {
            if(typeof iframe.getAttribute("FRAMEBORDER") != "undefined") { 
                // remove all borders from IFrames       
                iframe.setAttribute("FRAMEBORDER","0");
                iframe.setAttribute("ALLOWTRANSPARENCY","true");
                // forcing redraw
                iframe.parentNode.innerHTML = iframe.parentNode.innerHTML;
            }
        }
        
        return {
            traverseIFrames: traverseIFrames,
            removeIEBorders: function() { if(document.attachEvent) traverseIFrames(removeIEBorder); }
        };
    })();
    
    // ====  Cookies  =========================================================
    function getCookie(name) {                  // a little outdated cookie api
        var data = new Object();
        var strNum, valAll, keyName, subVal;
        var i = 0;
        var clen = document.cookie.length;

        while (i < clen) {                          // Alle Cookies durchlaufen        
            strNum = document.cookie.indexOf (";", i);  // "Nummer" des Cookies
            if (strNum == -1) strNum = document.cookie.length;  // Nur 1 Cookie
            valAll = unescape(document.cookie.substring(i, strNum)); // name=values auslesen
            keyName = valAll.substring(0, valAll.indexOf("=", 0)); // Name des Cookie zurueck
            subVal = valAll.substring(valAll.indexOf("=") + 1); // ab '=' Werte zurueck
            data[keyName] = (data[keyName]) ? data[keyName] + subVal : subVal;
            i = strNum + 2;                  // Leerzeichen nach ; Ueberspringen
        }
        
        if(name) {
            if(typeof(data[name])!="undefined")
            {
                return data[name];                  // gefundenes Cookie zurueck
            }
            else return 0;                   // Gesuchtes Cookie nicht gefunden
        } else {
            return data;                                 // Alle Cookies zurueck
        }
    }

    function setCookie(name, value, ttl, path) {
        var expire = new Date();
        var string2Sav, diff;
        
        if(!path) path = '/';
        
        if(ttl>0) {                                         // Speichere Cookie
            value = escape(value);
            expire.setTime(ttl*1000);
            string2Sav=name + "=" + value + "; expires=" + expire.toGMTString() + ";path=" + path;
            oldCki=getCookie(name);

            if(oldCki!=0) {                      // Wenn Cookie schon existiert
                diff = value.length - escape(oldCki).length; // Differenz zwischen Neuem und Alten Inhalt
                if(document.cookie.length + diff > 4096) { // Gesamtgroesse darf nicht groesser 4kB sein!
                    return "Zu wenig Speicher frei um &Auml;nderungen zu speichern!";
                }
            } else if(document.cookie.length+string2Sav.length > 4096) { // Zu wenig Speicher fuer neues Cookie
                return "Zu wenig Speicher frei um neues Element zu speichern!";
            }
            document.cookie = name + "=" + value + "; expires=" + expire.toGMTString() + ";path=" + path;
            if(document.cookie.length < 1) { // Nachtraegliche Kontrolle, ob Cookie wirklich gespeichert
                console.log("Fehler beim Speichern des Cookies.\nZu viele Daten zum Speichern!");
                return 0;
            }
            return 1;              
        } else {                                               // Loesche Cookie
            expire.setTime(0);
            document.cookie = name + "=''; expires=" + expire.toGMTString() + ";path=" + path;
            return 1;
        }
    } 
    // ------------------------------------------------------------------------
    
    if(![].forEach) {
        Array.prototype.forEach = function(callback) {
            for( var i=0, l=this.length; i<l; i++) callback(this[i]);
        };
    }
    // ------------------------------------------------------------------------
    
    function Exception(message, type) {
        this.message = message;
        this.type = type || "Exception";
        this.toString = function() {
            return this.type + ": " + this.message;
        };
    }
    Exception.prototype = new Error();
    Exception.prototype.constructor = Exception;
        
    // ====  Improved functionalities  ========================================    
    window.addEvent = function (obj, type, fn, bub) {
        // if(!obj || typeof obj != "object") throw new Exception("TypeError: addEvent(obj, type, fn, bub) needs an object!");
        try {
            if(obj.addEventListener) {
                obj.addEventListener(type, fn, bub ? bub : false);
            } else {
                // no use of attachEvent() 'cause of very buggy behaviour in IE<=8
                if(type == "DOMContentLoaded") { // obj.onreadystatechange = function() {};
                    type = "load";
                }                

                // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
                if(!obj["e"+type]) obj["e"+type] = new Observerable();
                obj["e"+type].attach(obj, fn);
                if(!obj["on"+type]) { 
                    obj["on"+type] = function(e) {
                        e = e || window.event;  
                        e.cancelBubble = bub;
                        obj["e"+type].notify(e); 
                        if(typeof e.preventDefault == "function") {
                            return e.preventDefault();
                        }
                    };
                }
            }
        } catch(e) {
            throw new Exception(e.stack);
        }
    }
    
    window.removeEvent = function (obj, type, fn) {
        if (obj.removeEventListener) {
            obj.removeEventListener(type, fn, false);
        } else if(obj["e"+type]) {
            obj["e"+type].detach(obj, fn);
        }
    }
    
    if (!Array.prototype.indexOf) { // for IE8
        // adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FindexOf#Compatibility
        Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
            'use strict';
            if (this == null) { throw new TypeError(); }
            var n, k, t = Object(this), len = t.length >>> 0;

            if (len === 0) return -1;
            n = 0;
            if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n != n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n != 0 && n != Infinity && n != -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) return -1;
            for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }
    
    // http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/#more-2838
    Object.toType = (function toType(global) { 
        return function(obj) {
            if (obj === global) {
              return "global";
            }
            return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
        }
    })(this);
    
    Object.clone = function(obj) {
        if (obj == null || typeof obj != 'object') {        
            return obj;    
        }
        if(typeof JSON != "undefined") {
            return (JSON.parse(JSON.stringify(obj)));
        }
        
        var temp = obj.constructor(); // give temp the original obj's constructor    
        for (var key in obj) {        
            temp[key] = Object.clone(obj[key]);    
        }     
        return temp;
    };
    
    // ----  String extensions  -----------------------------------------------
    String.format = function(string) { 
        var args = arguments; 
        var pattern = RegExp("%([1-" + (arguments.length-1) + "])", "g");
        return string.replace(pattern, function(match, index) { 
            return args[index]; 
        }); 
    }; 
    String.prototype.capitalize = function(){ 
        return this.replace(/(\w)/, function(s) { return s.toUpperCase(); });
    };
    String.prototype.toCamel = function(){ 
        return this.replace(/(\-[a-z])/g, function(s) { return s.toUpperCase().replace('-',''); });
    };
    String.prototype.toUnderscore = function(){
        return this.replace(/([A-Z])/g, function(s) { return "_" + s.toLowerCase(); });
    };
    String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, ""); };
    // ------------------------------------------------------------------------
        
    // ====  Construction  ====================================================
    addEvent(window, "DOMContentLoaded", function(e) {
        if(_removeIEBorders) H_modul.removeIEBorders();
        
        window.innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        window.innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        
        // fwd XFC messages as events
        if(parent) parent.postMessage(XFC_modul.Events.onInit + ";", "*"); 
    });    
    // ------------------------------------------------------------------------
        
    // public methods and properties wrapped in a return 
    // statement and using the object literal
    return {
        dom: DOM_modul, 
        lsh: LSH_modul, // location.search helpers
        was: H_modul,   // hacks/workarounds
        xfc: XFC_modul, // cross frame communication
        MousePos: XFC_modul.MousePos,
        
        Observerable: Observerable,        
        getCookie: getCookie,
        setCookie: setCookie
    }
}();
