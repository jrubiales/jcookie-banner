/**
 * JCookieBanner JS Script
 * @author Juan Fran
 */

 (function(context){
    'use strict';           // Usado en este ámbito.

    // Segundos que hay en un 1ms.
    var SECONDS = 0.001;

    var BANNER_ID = 'jcookie-banner';
    var BANNER_HEADER_ID = 'jcookie-banner-header';
    var BANNER_BODY_ID = 'jcookie-banner-body';

    // En este caso context = window, por lo que win = context.
    // Si cambiaramos el contexto, win = window, para poder acceder al objeto window.
    var win = context; 
    var doc = win.document;

    /*
     * Helper para el manejo de cookies.
     */
    context.cookies = {

        set: function(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }
            doc.cookie = name + "=" + value + expires + "; path=/";
        },    

        get: function(name) {
            var nameEQ = name + "=";
            var ca = doc.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        },

        erase: function(name) {
            this.set(name, "", -1);
        },

        exists: function(name) {
            return (this.get(name) !== null);
        }

    };

    context.JCookieBanner = {

        // Default config
        defaults : {

            /* Opciones generales */
            themeClass: 'jcb-dark',
            mode: 'permissive',
            headerAlign: 'left',
            bannerPosition: 'bottom',
            autoHide: true,
            showBannerOnce: false,
            timeOut: 10,
            scriptLoader: '/js/jcookie-banner-loader.js',

            /* cookie que se usa para ocultar la barra una vez se ha aceptado el mensaje */
            cookie: {
                name: 'jcookie',
                expire: 365
            },

            /* Opciones de internalización */
            locale: 'en_GB',
            translation: null,
            localeDir: '/locale',
            
            onAcceptClick: function(){
                /* Código a ejecutar cuando se acepta */
            },
            
            onDisagreeClick: function(){
                /* Código a ejecutar cuando no se acepta */
            }            
        },

        $eHeight: 0,            // Element height
        $cBanner: null,
        $cBannerBody: null,
        $cBannerHeader: null,
        timer: null,            // Timer for AutoHide

        initialize: function(config) {

            this.config = $.extend({}, this.defaults, config);

            if(this.config.bannerPosition !== 'bottom' && this.config.bannerPosition !== 'top')
                throw 'Valor ' + this.config.bannerPosition + ' para el atributo "bannerPosition" no válido';

            if(this.config.headerAlign !== 'left' && this.config.headerAlign !== 'right')
                throw 'Valor ' + this.config.headerAlign + ' para el atributo "headerAlight" no válido';

            if(this.config.mode !== 'permissive' && this.config.mode !== 'strict')
                throw 'Valor ' + this.config.mode + ' para el atributo "mode" no válido';

            this.$cBanner = $('#' + BANNER_ID);

            // Comprobar si existe la cookie del banner.
            if (context.cookies.exists(this.config.cookie.name)) {
                this.$cBanner.hide();
                // Include code                
                this.loadScript(this.config.scriptLoader);
                return;
            }

            // Crear estructura.
            this.$cBanner.addClass(this.config.themeClass);

            if(this.config.bannerPosition === 'bottom'){

                this.$cBanner.css('bottom', 0);
                this.$cBanner.append('<div id="' + BANNER_HEADER_ID + '" class="header-top"></span></div>')
                             .append('<div class="clearfix"></div>')
                             .append('<div id="' + BANNER_BODY_ID + '"></div>');

            } else if(this.config.bannerPosition === 'top'){ 

                this.$cBanner.css('top', 0);  
                this.$cBanner.append('<div id="' + BANNER_BODY_ID + '"></span></div>')
                             .append('<div class="clearfix"></div>')
                             .append('<div id="' + BANNER_HEADER_ID + '" class="header-bottom"></div>');

            }

            this.$cBannerHeader = $('#' + BANNER_HEADER_ID);

            if(this.config.headerAlign === 'left')
                this.$cBannerHeader.addClass('left-header');
            else if(this.config.headerAlign === 'right')
                this.$cBannerHeader.addClass('right-header');

            this.$cBannerBody = $('#' + BANNER_BODY_ID);

            // Generar html y cargar traducciones.
            var langCode = this.config.locale.substring(0,2);
            this.loadTranslation(function(translation) {

                var cL = context.JCookieBanner;

                cL.$cBannerHeader.html('<span class="title"><a href="#">' + translation.title + '</a>');
                
                cL.$cBannerHeader.find('a').on('click', function(event){
                    cL.onHeaderClick();
                    return false;
                });

                if(cL.config.mode === 'permissive'){
                    
                    cL.$cBannerBody.html('<p>' + translation.permissive_text + 
                        ' <a href="#">' + translation.here + '</a>' + 
                        ' - <a href="#" class="lAgree">' + translation.understood + '</a></p>');

                    // Carga los scripts sin preguntar. (modo permissive)
                    cL.onPermissiveAccept();
                    
                    $('.lAgree').on('click', function(){
                        cL.config.onAcceptClick();
                        cL.$cBanner.hide();
                    });
                
                } else if(cL.config.mode === 'strict'){

                    cL.$cBannerBody.html('<p>' + translation.strict_text + 
                        ' <a href="#">' + translation.here + '</a>' + 
                        ' - <a href="#" class="lAgree">' + translation.agree + '</a> | <a href="#" class="lDisagree">' + translation.disagree + '</a></p>');

                    $('.lAgree').on('click', function(){
                        cL.onStrictAccept();
                    });
                            
                    $('.lDisagree').on('click', function(){
                        cL.onStrictDisagree();
                    });

                }

            }, langCode);

            // ¿showBannerOnce?
            if(this.config.showBannerOnce)
                setTimeout(function(){
                    context.JCookieBanner.$cBanner.hide();
                }, this.config.timeOut/SECONDS);
            else
                // autoHide?
                if(this.config.autoHide) this.timer = this.autoHide();
                   
            // Resize event
            $(win).on('resize', function(event){
                context.JCookieBanner.onResize();
            });

        },

        onHeaderClick : function(){
            if (this.$cBanner.hasClass('hide')) this.show();     // Mostrar
            else this.hide();                                    // Cerrar        
        },

        show: function(){
            this.$cBanner.removeClass('hide').animate(function(){
                var cL = context.JCookieBanner;
                if(cL.config.bannerPosition==='top')
                    return {'top': '+=' + (cL.$cBannerBody.height())};
                else if(cL.config.bannerPosition==='bottom') 
                    return {'bottom': '+=' + (cL.$cBannerBody.height())};
            }(), 100);

            if(this.config.autoHide) this.timer = this.autoHide();
        },

        hide : function(){
            this.$cBanner.addClass('hide').animate(function(){
                var cL = context.JCookieBanner;
                if(cL.config.bannerPosition==='top')
                    return {'top': '-=' + (cL.$cBannerBody.height())};
                else if(cL.config.bannerPosition==='bottom') 
                    return {'bottom': '-=' + (cL.$cBannerBody.height())};
            }(), 100);
            if(this.config.autoHide) clearTimeout(this.timer);
        },

        autoHide: function(){     
            return setTimeout(function(){ context.JCookieBanner.hide(); }, this.config.timeOut/SECONDS); 
        },

        onResize : function(){      
            this.$eHeight = this.$cBannerHeader.height() + this.$cBannerBody.height();
            // Update height and position
            this.$cBanner.css('height', this.$eHeight);
            if (this.$cBanner.hasClass('hide'))
                this.$cBanner.css(this.config.bannerPosition, -this.$cBannerBody.height()); 
            else this.$cBanner.css(this.config.bannerPosition, 0);
        },
        
        onPermissiveAccept : function(){
            // Cargar el script
            this.loadScript(this.config.scriptLoader);
            // Crear la cookie para ocultar la barra
            context.cookies.set(this.config.cookie.name, 'accept', this.config.cookie.expire);
        },
        
        onStrictAccept : function(){
            this.onPermissiveAccept();
            this.config.onAcceptClick();
            this.$cBanner.hide();
        },
        
        onStrictDisagree : function(){
            this.$cBanner.hide();
            this.config.onDisagreeClick();
        },

        loadTranslation: function(callback, langCode) {
            if(this.config.translation===null){
                var jsonFile = this.config.localeDir + '/' + langCode + '/' + this.config.locale + '.json';   
                var jqxhr = $.get(jsonFile, function(data) {
                    callback(data);
                }).fail(function() {
                     throw 'Error al cargar la traducción'; 
                });
            } else callback(this.config.translation);
        },
           
        loadScript : function(src){
            var s = doc.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = src;
            var head = doc.getElementsByTagName('head')[0];
            head.appendChild(s);
        }
    
    };

})(window); // Podemos asignarle el contexto que queramos.