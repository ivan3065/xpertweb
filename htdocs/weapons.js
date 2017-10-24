/* 
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/

;(function ( $, window, document, undefined ) {
        $.widget( "xpert.weaponlist" , {
                  options : {
                  },
                  _create: function () {
                        this.element.addClass('xmud-weaponlist');
                        this.__repaintNeeded=true;
                        this.__heatData={
                            heat:0,
                            heatDissipation:0
                        };
			this.__weaponSpecs=[];
			this.__weapons=[];
			this.__limbStatus={};
		  },		  

                  updateMech: function updateMech(mech) {
                    // Happens often, only repaint if our heat changed
                    $.each(this.__heatData, (function(key,olddata) {
                      if (mech[key] != null && mech[key] != olddata) {
                        this.__heatData[key]=mech[key];
                        this.__repaintNeeded=true;
                      }
                    }).bind(this));
                    if (this.__repaintNeeded) {
                      setTimeout(this.paint.bind(this),20);
                    }
                  },
                  
                  updateWeaponSpecs: function(ws) {
                    // Happens mostly once at startup
                    this.__weaponSpecs=ws;
                    this.__repaintNeeded=true;
                    setTimeout(this.paint.bind(this),20);
                  },
                  
                  updateWeapons: function updateWeapons(wl) {
                    // Happens often. filter.

                    this.__weapons=wl;
                    if (this.__repaintNeeded) {
                      setTimeout(this.paint.bind(this),20);
                    }
                    
                  },
                    
                  updateLimbs: function updateLimbs(li) {
                    // Happens often. filter.
                    this.__limbStatus=li;
                  
                    if (this.__repaintNeeded) {
                      setTimeout(this.paint.bind(this),20);
                    }
                  },
                  
                  paint: function paint() {
                    this.element.text(JSON.stringify([this.__limbStatus,this.__weapons]));
                     this.__repaintNeeded=false;      
                  }
       });
})( jQuery, window, document );
        