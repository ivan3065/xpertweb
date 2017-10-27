/* 
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/

;(function ( $, window, document, undefined ) {
        $.widget( "xpert.contactlist" , {
                  options : {
                  },
                  _create: function () {
                        this.element.addClass('xmud-contactlist');
                        this.__repaintNeeded=true;
                        this.__contacts=[];
                  },              

                  updateOwn: function updateOwn(mech) {
                    this.__self=mech;
                    this.__repaintNeeded=true;
                    setTimeout(this.paint.bind(this),10);
                  },
                  updateContacts : function updateContacts(contactlist) {
                    // TODO...
                    this.__contacts=contactlist;
                    this.__repaintNeeded=true;
                    setTimeout(this.paint.bind(this),10);
                  },


                 paint: function paint() {
                 // TODO
                    this.element.text(JSON.stringify(this.__contacts));
                     this.__repaintNeeded=false;      
                  }
       });
})( jQuery, window, document );
