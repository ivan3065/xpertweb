"use strict";

/* 
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/


;(function ( $, window, document, undefined ) {

        // Hidden constants
        var HEXNormWidth=2.0 * Math.tan(Math.PI/6.0);
        var HEXNormHeight=1.0;

        // TODO: Might make sense to give those in actual pixels, not in hex tiles. 
        // Or make it depend on zoom level?
        var OVERSCANX=8; // MIN value is 2
        var OVERSCANY=12; // MIN value is 3
        
        // For faster generation of empty/unknown map areas;
        var MAPUNKNOWN="????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????";

        var MAGIC_SPEED_CONSTANT=660000; // msec * KPH-Speed to mux-units. VAries a bit 640000 .. 700000, probably caused by hudinfo bug/rounding in MUX hcode

        var DEFAULT_STYLE={hexcolors:{
 "??": "rgb(124,127,233)",
 "\"0": "rgb(18,88,18)",
 "\"1": "rgb(13,65,13)",
 "\"2": "rgb(10,50,10)",
 "\"3": "rgb(8,40,8)",
 "\"4": "rgb(7,33,7)",
 "\"5": "rgb(6,29,6)",
 "\"6": "rgb(5,26,5)",
 "\"7": "rgb(5,24,5)",
 "\"8": "rgb(5,23,5)",
 "\"9": "rgb(5,23,5)",
 "`0": "rgb(49,140,49)",
 "`1": "rgb(36,103,36)",
 "`2": "rgb(28,79,28)",
 "`3": "rgb(22,63,22)",
 "`4": "rgb(18,53,18)",
 "`5": "rgb(16,46,16)",
 "`6": "rgb(14,41,14)",
 "`7": "rgb(13,38,13)",
 "`8": "rgb(13,37,13)",
 "`9": "rgb(13,37,13)",
 "#0": "rgb(148,143,136)",
 "#1": "rgb(109,105,100)",
 "#2": "rgb(84,81,77)",
 "#3": "rgb(67,65,62)",
 "#4": "rgb(56,54,52)",
 "#5": "rgb(49,47,45)",
 "#6": "rgb(44,42,41)",
 "#7": "rgb(41,39,38)",
 "#8": "rgb(40,38,37)",
 "#9": "rgb(40,38,37)",
 "%0": "rgb(232,213,8)",
 "%1": "rgb(223,204,8)",
 "%2": "rgb(205,188,7)",
 "%3": "rgb(180,165,6)",
 "%4": "rgb(151,139,5)",
 "%5": "rgb(121,111,4)",
 "%6": "rgb(92,84,3)",
 "%7": "rgb(66,60,2)",
 "%8": "rgb(45,41,1)",
 "%9": "rgb(29,26,1)",
 "&0": "rgb(140,35,21)",
 "&1": "rgb(103,26,15)",
 "&2": "rgb(79,20,12)",
 "&3": "rgb(63,16,10)",
 "&4": "rgb(53,13,8)",
 "&5": "rgb(46,11,7)",
 "&6": "rgb(41,10,6)",
 "&7": "rgb(38,9,6)",
 "&8": "rgb(37,9,6)",
 "&9": "rgb(37,9,6)",
 "+0": "rgb(250,250,255)",
 "+1": "rgb(240,240,245)",
 "+2": "rgb(221,221,225)",
 "+3": "rgb(194,194,198)",
 "+4": "rgb(163,163,166)",
 "+5": "rgb(130,130,133)",
 "+6": "rgb(99,99,101)",
 "+7": "rgb(71,71,73)",
 "+8": "rgb(48,48,50)",
 "+9": "rgb(31,31,32)",
 "-0": "rgb(230,230,255)",
 "-1": "rgb(221,221,245)",
 "-2": "rgb(203,203,225)",
 "-3": "rgb(179,179,198)",
 "-4": "rgb(150,150,166)",
 "-5": "rgb(120,120,133)",
 "-6": "rgb(91,91,101)",
 "-7": "rgb(66,66,73)",
 "-8": "rgb(45,45,50)",
 "-9": "rgb(29,29,32)",
 ".0": "rgb(147,175,140)",
 ".1": "rgb(108,128,103)",
 ".2": "rgb(83,98,79)",
 ".3": "rgb(66,78,63)",
 ".4": "rgb(55,65,53)",
 ".5": "rgb(48,56,46)",
 ".6": "rgb(43,50,41)",
 ".7": "rgb(40,47,38)",
 ".8": "rgb(39,45,37)",
 ".9": "rgb(39,45,37)",
 "/0": "rgb(148,143,136)",
 "/1": "rgb(109,105,100)",
 "/2": "rgb(84,81,77)",
 "/3": "rgb(67,65,62)",
 "/4": "rgb(56,54,52)",
 "/5": "rgb(49,47,45)",
 "/6": "rgb(44,42,41)",
 "/7": "rgb(41,39,38)",
 "/8": "rgb(40,38,37)",
 "/9": "rgb(40,38,37)",
 "$0": "rgb(42,42,119)",
 "$1": "rgb(31,31,87)",
 "$2": "rgb(24,24,67)",
 "$3": "rgb(19,19,54)",
 "$4": "rgb(16,16,45)",
 "$5": "rgb(14,14,39)",
 "$6": "rgb(13,13,35)",
 "$7": "rgb(12,12,33)",
 "$8": "rgb(12,12,32)",
 "$9": "rgb(12,12,32)",
 ":0": "rgb(70,70,70)",
 ":1": "rgb(68,68,68)",
 ":2": "rgb(65,65,65)",
 ":3": "rgb(60,60,60)",
 ":4": "rgb(54,54,54)",
 ":5": "rgb(47,47,47)",
 ":6": "rgb(40,40,40)",
 ":7": "rgb(33,33,33)",
 ":8": "rgb(26,26,26)",
 ":9": "rgb(20,20,20)",
 ";0": "rgb(50,50,60)",
 ";1": "rgb(49,49,59)",
 ";2": "rgb(47,47,56)",
 ";3": "rgb(43,43,52)",
 ";4": "rgb(39,39,47)",
 ";5": "rgb(34,34,41)",
 ";6": "rgb(29,29,35)",
 ";7": "rgb(24,24,29)",
 ";8": "rgb(19,19,23)",
 ";9": "rgb(15,15,18)",
 "=0": "rgb(112,112,108)",
 "=1": "rgb(82,82,79)",
 "=2": "rgb(63,63,61)",
 "=3": "rgb(50,50,49)",
 "=4": "rgb(42,42,41)",
 "=5": "rgb(36,36,36)",
 "=6": "rgb(32,32,32)",
 "=7": "rgb(30,30,30)",
 "=8": "rgb(29,29,29)",
 "=9": "rgb(29,29,29)",
 "@0": "rgb(133,143,129)",
 "@1": "rgb(98,105,95)",
 "@2": "rgb(75,81,73)",
 "@3": "rgb(60,65,58)",
 "@4": "rgb(50,54,48)",
 "@5": "rgb(43,47,42)",
 "@6": "rgb(39,42,38)",
 "@7": "rgb(36,39,35)",
 "@8": "rgb(35,38,34)",
 "@9": "rgb(35,38,34)",
 "^0": "rgb(232,164,8)",
 "^1": "rgb(223,157,8)",
 "^2": "rgb(205,144,7)",
 "^3": "rgb(180,127,6)",
 "^4": "rgb(151,107,5)",
 "^5": "rgb(121,86,4)",
 "^6": "rgb(92,65,3)",
 "^7": "rgb(66,47,2)",
 "^8": "rgb(45,32,1)",
 "^9": "rgb(29,20,1)",
 "~0": "rgb(100,100,230)",
 "~1": "rgb(93,93,215)",
 "~2": "rgb(81,81,186)",
 "~3": "rgb(65,65,149)",
 "~4": "rgb(48,48,109)",
 "~5": "rgb(32,32,73)",
 "~6": "rgb(19,19,44)",
 "~7": "rgb(10,10,23)",
 "~8": "rgb(5,5,11)",
 "~9": "rgb(2,2,4)",
 "}0": "rgb(140,140,90)",
 "}1": "rgb(134,134,86)",
 "}2": "rgb(123,123,79)",
 "}3": "rgb(108,108,70)",
 "}4": "rgb(91,91,59)",
 "}5": "rgb(73,73,47)",
 "}6": "rgb(55,55,36)",
 "}7": "rgb(40,40,26)",
 "}8": "rgb(27,27,18)",
 "}9": "rgb(17,17,12)"
}};
        // MAth helper (seperate file?)
        function _lineIntersection(line1start,line1end, line2start,line2end) {

          var denominator, a, b, numerator1, numerator2;
          denominator = ((line2end[1] - line2start[1]) * (line1end[0] - line1start[0])) - ((line2end[0] - line2start[0]) * (line1end[1] - line1start[1]));
          if (denominator == 0) {
              return null; // parallel lines or zero-point-line
          }
          a = line1start[1] - line2start[1];
          b = line1start[0] - line2start[0];
          numerator1 = ((line2end[0] - line2start[0]) * a) - ((line2end[1] - line2start[1]) * b);
          numerator2 = ((line1end[0] - line1start[0]) * a) - ((line1end[1] - line1start[1]) * b);
          a = numerator1 / denominator;
          b = numerator2 / denominator;
	  // Now a nd b are the "percentage" of each line where they match. we only want matches inside the line
	
	 if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
          return [ line1start[0] + (a * (line1end[0] - line1start[0])),
                   line1start[1] + (a * (line1end[1] - line1start[1])) ];
         }
         /*
              // it is worth noting that this should be the same as, calculating in the b-line
              x = line2start[0] + (b * (line2end[0] - line2start[0]));
              y = line2start[0] + (b * (line2end[1] - line2start[1]));
              */
          return null;
        
        }



	$.widget( "xpert.mapview", $.ui.mouse, {	
	          options : {
                    zoom: 50, // distance between two hexcenters in px
                    deformation: 1.05, // width-for-height
                    followSelf: false,
                    extrapolate: true, // Try to guess mech positions between hudinfo calls
                    scrollX: 0,
                    scrollY: 0, // scrolling in pixels,
                    distance: 10,
                    style: "default"
                    
	          },
		  _create: function () {
		  	this.element.addClass('xmud-mapview');
		  	this._mouseInit();
		  	this.__style=DEFAULT_STYLE;
		  	
		  	// TODO: Is that the right way? Using the out-of-plugin external jquery methods instead of the internal inherited ones?
//		  	this.element.on("mousedown",this.__mapMouseDown.bind(this));
		  	this.element.on("click",this.__mapMouseClick.bind(this));
		  	this.element.on("mouseup",this.__mapMouseUp.bind(this));
 	        	this.element.on("dblclick",this.__mapMouseDblClick.bind(this));
 	        	this.element.on("contextmenu",this.__mapContext.bind(this));
                        
                        this.__width=this.element.innerWidth();
                        this.__height=this.element.innerHeight();
                        
		  	this.element.mousewheel(this.__mapMouseWheel.bind(this));
                        this._precalculate();
		  	
		  	this.mapcanvas=$('<canvas></canvas>')[0];
		  	this.mapcanvas.width=Math.ceil(this.__width/this.fullHexWidth+OVERSCANX)*this.fullHexWidth;
		  	this.mapcanvas.height=Math.ceil(this.__height/this.hexHeight+OVERSCANY)*this.hexHeight;
		  	
		  	
		  	// Pixel-Offset for the mapcanvas overlap inside the mapview. 
		  	this.mapCanvasPixelScroll=[0, 0];
		  	this.mapcanvas.style.top=(-this.mapCanvasPixelScroll[1])+'px';
		  	this.mapcanvas.style.left=(-this.mapCanvasPixelScroll[0])+'px';
		  	this.element.append(this.mapcanvas);
		  	this.repaintMapNeeded=false;
                        
                        // Integer - HEX-Offset where to start upper-left corner of *off-screen* mapcanvas
                        this.mapOffset=[0, 0]; 
                        
                        this.mapdata={
                          width: 500,
                          height: 500,
                          name: "",
                          map: []
                        };


                        // TODO: Really two canvases for own and contacts? Better one, and one for UI elements?
		  	this.contactscanvas=$('<canvas></canvas>')[0];
		  	this.contactscanvas.width=this.__width;
		  	this.contactscanvas.height=this.__height;
		  	this.element.append(this.contactscanvas);
		  	// Temporary offset of contacts canvas, only used during scroll, reset to 0,0 on paint
		  	this.contactsCanvasPixelScroll=[0, 0];
		  	this.contactscanvas.style.top=(-this.contactsCanvasPixelScroll[1])+'px';
		  	this.contactscanvas.style.left=(-this.contactsCanvasPixelScroll[0])+'px';
		  	
		  	
		  	this.repaintContactsNeeded=false;
		  	this.contacts=[];
		  	
		  	this.owncanvas=$('<canvas></canvas>')[0];
		  	this.owncanvas.width=this.__width;
		  	this.owncanvas.height=this.__height;
		  	this.element.append(this.owncanvas);
		  	// Temporary offset of own canvas, only used during scroll, reset to 0,0 on paint
		  	this.ownCanvasPixelScroll=[0, 0];
		  	this.owncanvas.style.top=(-this.ownCanvasPixelScroll[1])+'px';
		  	this.owncanvas.style.left=(-this.ownCanvasPixelScroll[0])+'px';



		  	this.repaintOwnNeeded=false;
		  	// TODO: Warum kein hudinfo-Mech-Object?
		  	this.ownmech={
		  	  id:'??',
		  	  heading:0,
		  	  desiredHeading:0,
		  	  speed:0,
		  	  desiredSpeed:0,
		  	  turret: 0,
		  	  type:'i',
		  	  position: null,
		  	  flags:''
		  	};
		  	
		  	// For X/Y Markers
		  	this.legendcanvas=$('<canvas></canvas>')[0];
		  	this.legendcanvas.width=this.__width;
		  	this.legendcanvas.height=this.__height;
		  	this.element.append(this.legendcanvas);
                        this.repaintLegendNeeded=false;
		  	

                        if (this.options.style != "default") {
                          this.loadStyle(this.options.style);
                        }



                       this.queueMapRepaint(500);
                       this.queueLegendRepaint(505);
                       this.queueOwnRepaint(510);
                       this.queueContactsRepaint(520);
                       this.__checkIval=setInterval(this.checkSize.bind(this),1213);
                        
		  },
		  _destroy: function () {
		  	console.log("xpert.mapview.destroy");
                        this._mouseDestroy();
                        clearInterval(this.__checkIval);
		  },
		  loadStyle: function(stylename) {
		    if (stylename=='default') { // built in
		       this.__style=DEFAULT_STYLE;
                       this.queueMapRepaint();
                       this.queueLegendRepaint();
                       this.queueOwnRepaint();
                       this.queueContactsRepaint();
		       return;
		    }
		    // fetch by ajax
		    $.getJSON(stylename+"/style.json",(function(response) {
		      if (response && response.hexcolors) {
		        console.log("Style change: "+response.label);
		        this.__style=response;
                        this.queueMapRepaint();
                        this.queueLegendRepaint();
                        this.queueOwnRepaint();
                        this.queueContactsRepaint();
		      }
		    }).bind(this));
		  
		  },
		  checkSize : function() {
		     if (this.element.innerWidth()>0 && this.element.innerHeight()>0 && (this.__width!=this.element.innerWidth() || this.__height!=this.element.innerHeight())) {
		         this.__width=this.element.innerWidth();
                         this.__height=this.element.innerHeight();
                         this.mapcanvas.width=Math.ceil(this.__width/this.fullHexWidth+OVERSCANX)*this.fullHexWidth;
                         this.mapcanvas.height=Math.ceil(this.__height/this.hexHeight+OVERSCANY)*this.hexHeight;
                         this.contactscanvas.width=this.__width;
                         this.contactscanvas.height=this.__height;
                         this.owncanvas.width=this.__width;
                         this.owncanvas.height=this.__height;
                         this.legendcanvas.width=this.__width;
                         this.legendcanvas.height=this.__height;
                                                                                                                                                                                               		                                 
                        this.queueMapRepaint();
                        this.queueLegendRepaint();
                        this.queueOwnRepaint();
                        this.queueContactsRepaint();
		    }
		  },
		  queueMapRepaint: function(to) {
                        if (!this.repaintMapNeeded) {  
                          this.repaintMapNeeded=true;
                          setTimeout(this.paintMap.bind(this),to?to:100); 
                        }
		  },
		  queueOwnRepaint: function(to) {
                        if (!this.repaintOwnNeeded) {  
                          this.repaintOwnNeeded=true;
                          setTimeout(this.paintOwn.bind(this),to?to:20); 
                        }
		  },
		  queueContactsRepaint: function(to) {
                        if (!this.repaintContactsNeeded) {  
                          this.repaintContactsNeeded=true;
                          setTimeout(this.paintContacts.bind(this),to?to:30); 
                        }
		  },
		  queueLegendRepaint: function(to) {
                        if (!this.repaintLegendNeeded) {  
                          this.repaintLegendNeeded=true;
                          setTimeout(this.paintLegend.bind(this),to?to:30); 
                        }
		  },
		  zoom: function zoom(value, focuspoint) {
   	           // recalculate positions/offsets
   	              if (!focuspoint) {
   	                focuspoint=[this.__width/2, this.__height/2];
   	              }
   	              
		       var oldzoom=this.options.zoom;
		       if (value < 6) { value=6; } // 6 is smallest sensible... lower gets bad distortion
		       if (value > 200) { value=200; }
                       if (value == this.options.zoom) { return; /* or if precalculate gets no different INT-Hex-size from changed zoom*/ }

		       this.options.zoom=value;

    	               var mapfocus=this._mapPos([focuspoint[0] + this.options.scrollX,  focuspoint[1] + this.options.scrollY]);
    	               // console.log("Focus point",focuspoint,"is on map",mapfocus);
		       this._precalculate();
		       
		       var newfocus=this._pixelPos(mapfocus);
		       // console.log("which translates back to ",newfocus);
                       // adjust to focus offset
                       newfocus[0]-=focuspoint[0];
                       newfocus[1]-=focuspoint[1];


                       // width assignment causes clear!
		       this.mapcanvas.width=Math.ceil(this.__width/this.fullHexWidth+OVERSCANX)*this.fullHexWidth;
                       this.mapcanvas.height=Math.ceil(this.__height/this.hexHeight+OVERSCANY)*this.hexHeight;
		       // reset all this stuff, pretent our mapcanvas is again freshly at 0,0
                       this.mapCanvasPixelScroll[0]=0;
                       this.mapCanvasPixelScroll[1]=0;
                       this.mapOffset[0]=0;
                       this.mapOffset[1]=0;
                       this.options.scrollX=0;
                       this.options.scrollY=0;

		       // then recalculate/bounds scrollX,scrollY,mapCanvasPixelScroll, mapcanvas.style.top/left is all done by scroll-fkt!
//                       this._setOption('scrollXY',newfocus);
                       this.scroll(newfocus[0],newfocus[1]); 

                       //this.queueMapRepaint(10); // Redraw immediatlty to avoid blue flicker
                       this.paintMap();
//                       this.queueOwnRepaint();
                       this.paintOwn();
                       this.queueContactsRepaint();
                       this.queueLegendRepaint();
                  },
                  scroll: function scroll(nScrollX,nScrollY) {
                       var oSX=Math.round(this.options.scrollX);
                       var oSY=Math.round(this.options.scrollY);
                       this.options.scrollX=Math.min(Math.max(0,nScrollX),Math.max(0,this.mapdata.width*this.hexWidth+this.fourthHexWidth-this.__width));
                       this.options.scrollY=Math.min(Math.max(0,nScrollY),Math.max(0,this.mapdata.height*this.hexHeight+this.halfHexHeight-this.__height));
                       if (oSX==this.options.scrollX && oSY==this.options.scrollY) return; // shortcut
                       
                       var pdX=this.options.scrollX-oSX;
                       var pdY=this.options.scrollY-oSY;
                       this.mapCanvasPixelScroll[0]+=pdX;
                       this.mapCanvasPixelScroll[1]+=pdY;
                       this.contactsCanvasPixelScroll[0]+=pdX
                       this.contactsCanvasPixelScroll[1]+=pdY;
                       this.ownCanvasPixelScroll[0]+=pdX
                       this.ownCanvasPixelScroll[1]+=pdY;
                       
                       // calculate how much hidden area is available on the "other" side: TODO: Cache (this.mapcanvas.width - this.__width) ?
                       var xOverscroll=this.mapcanvas.width - this.__width - this.mapCanvasPixelScroll[0];
                       var yOverscroll=this.mapcanvas.height - this.__height - this.mapCanvasPixelScroll[1];
                       // check if out-of-bounds: trigger Re-Paint which will recalulcate mapOffset then
                       if ((this.mapCanvasPixelScroll[0] < this.fourthHexWidth && this.mapOffset[0]>0) || 
                           (this.mapCanvasPixelScroll[1] < this.halfHexHeight && this.mapOffset[1]>0) ||
                           (xOverscroll < this.fourthHexWidth /* no MapSize known */) ||
                           (yOverscroll < this.halfHexHeight)) {
                         this.queueMapRepaint(250);
                       }
                       // Have all those changes in one go, so maybe only one render-cycle in the browser is triggered until we redraw the canvases (canvii?)
                       this.mapcanvas.style.top=(-this.mapCanvasPixelScroll[1])+'px';
                       this.mapcanvas.style.left=(-this.mapCanvasPixelScroll[0])+'px';
	  	       this.contactscanvas.style.top=(-this.contactsCanvasPixelScroll[1])+'px';
                       this.contactscanvas.style.left=(-this.contactsCanvasPixelScroll[0])+'px';
	  	       this.owncanvas.style.top=(-this.ownCanvasPixelScroll[1])+'px';
                       this.owncanvas.style.left=(-this.ownCanvasPixelScroll[0])+'px';
                       
                       this.queueOwnRepaint(60); // use a bit longer timeouts to speedup scrolling. We moved the image with css anyways.
                       this.queueContactsRepaint(50); // 
                       this.queueLegendRepaint();
                  },
		  _setOption: function ( key, value ) {
		    switch (key) {
		     case "zoom":
		      this.zoom(value);
 	              break;
                     case "deformation":
                      this._super( key, value );
                      this.zoom(this.options.zoom+1);
                      break;

                     case "scrollX":
                       this.scroll(value,this.options.scrollY);
                       break;
                     case "scrollY":
                        this.scroll(this.options.scrollX,value);
                        break;
                     case "scrollXY":
                       this.scroll(value[0], value[1]);
                       break; 
		     break;
		     case "style":
		       this.loadStyle(value);
  		       // fallthrough
		     default:
                       this._super( key, value );
		    }
		  },
		  _precalculate: function() { // also call on zoom change

 		    this.halfHexHeight=Math.round(HEXNormHeight*this.options.zoom/2.0/this.options.deformation); // also: offset-pos to center
 		    this.hexHeight=this.halfHexHeight * 2;
 		    
 		    this.muxToScreenY=this.hexHeight/HEXNormHeight;
 		    
 		    
 		    this.fourthHexWidth=Math.round(HEXNormWidth*this.options.zoom/4.0);
 		    this.hexWidth=this.fourthHexWidth*3; // only one of the left/right corners included. == x-only dist between hexcenters
 		    this.halfHexWidth=this.fourthHexWidth*2;
 		    this.fullHexWidth=this.fourthHexWidth*4;
 		    
 		    this.muxToScreenX=this.fullHexWidth/HEXNormWidth;
		  
                  },
                  _pixelPos: function(mapPos) {
                     return [Math.round(mapPos[0]* this.muxToScreenX + this.halfHexWidth), 
                             Math.round(mapPos[1]* this.muxToScreenY + this.halfHexHeight)]; 
                  },
                  _mapPos: function(pixelPos) {
                     return [(pixelPos[0] - this.halfHexWidth) / this.muxToScreenX,
                             (pixelPos[1] - this.halfHexHeight)  / this.muxToScreenY];
                  },
		  centerOn: function centerOn(pos2d, focuspoint) {
                    // Move map Layer if position changed
                    var pixelPos=this._pixelPos(pos2d.mapXY());
                    // Adjust pixelPos so point is centered (use focusPoint instead of center if provided)
                    pixelPos[0] -= this.__width /2.0;
                    pixelPos[1] -= this.__height/2.0;
                    this._setOption('scrollXY',pixelPos);
		  },
		  // hudparser callback
		  updateOwnMechInfo: function updateOwnMechInfo(mech) {
		    var repaintNeeded=false;
		    var centerNeeded=false;
		    var mapRepaintNeeded=false;
		    this.ownmechObject=mech;
		    // TODO: Why do we need both this sack-of-variables and the Mech object?
		    $.each(this.ownmech, (function(key,olddata) {
		      if (mech[key] != null && ((mech[key].compare && !mech[key].compare(olddata)) || (!mech[key].compare && mech[key] != olddata))) {
                        this.ownmech[key]=mech[key];
                        if (key=='id') {
                         // id-change -> First-time in a new mech: Center, because thats most often leavebase or a new radiotower
                         centerNeeded=true;
                        }
                        if (key=='flags') {
                          // Flag change might need to change cliffings on map... redraw just in case
                           mapRepaintNeeded=true;
                        }
//                        console.log("changed key:",key);
                        repaintNeeded=true;
                        if (key=='position') {
                        
                          if (this.options.followSelf) {
                            // Need to re-centermap.
                            centerNeeded=true;
                          }
                          if (olddata && mech.position && olddata.z != mech.position.z) {
                            // Z-Level-Changes might change cliff lines.
                            mapRepaintNeeded=true;
                          }
                        }
		      }
		    }).bind(this));
		    this.__ownmech_stamp=new Date();

		    if (centerNeeded && this.ownmech.position) { // TODO: and distance old->new center > xx
		      this.centerOn(this.ownmech.position); // .calculateXY(layout)
                    }
		    if (repaintNeeded) {
		     this.queueOwnRepaint();
		    }
		    if (mapRepaintNeeded) {
		      this.queueMapRepaint();
		    }
		  },
		  // hudparser callback
		  updateContacts : function updateContacts(contactlist) {
  		    // TODO...
		    this.contacts=contactlist;
		    this.queueContactsRepaint();
		  },
		  // hudparser callback
		  updateWeaponSpecs: function(ws) {
                    // Happens mostly once at startup
                    this.__weaponSpecs=ws;
                    this.queueOwnRepaint();
                  },

		  updateWeapons: function updateWeapons(wl) {
                    // Happens often. filter updates well. changes to recycle-counter don't trigger redraw, we only need the ARC info

                     
                  },                  
		                                                                                                                      
		  // hudparser callback
		  updateMapInfo: function updateMapInfo(mapdata) {
		    var redraw=false;
                    if (mapdata.width) this.mapdata.width=mapdata.width; // no redraw
                    if (mapdata.height) this.mapdata.height=mapdata.height;
                    if (mapdata.name && mapdata.name != this.mapdata.name) {
                       // mapchange;
                       redraw=true;
                       this.mapdata.map=[];
                       this.mapdata.name=mapdata.name;
                       this.mapdata.id=mapdata.id;
                       this.mapdata.version=mapdata.version;
                    }
                    // now copy tiles
                    var ofX=mapdata.startX * 2;
                    var ofY=mapdata.startY;
                    for (var i=0; i < mapdata.slice.length; ++i) {
                      var nline=mapdata.slice[i];
                      var cline=this.mapdata.map[i+ofY];
                      if (typeof cline != 'string') { cline=''; }
                      // fill cline[0..ofX] with '??'
                      while (cline.length < ofX) {
                        cline = cline + MAPUNKNOWN.slice(0,ofX - cline.length);
                      }
                      
                      // TODO merge map in updated area
                      var merged=nline;
                      
                      // pos=nline.indexOf('?')...
                      
                      this.mapdata.map[i+ofY]=cline.slice(0,ofX)+merged+cline.slice(ofX+merged.length);
                    }
                    if (redraw || 1/*check if ofX/ofY - endX/endY affect currently scrolled region */) {
                      this.queueMapRepaint();
                    }
		  },
		  
		  
		  /// OWN
		  paintOwn: function() {

 	           // only in use during live-scroll to reduce ghosting. reset on redraw
     	            this.ownCanvasPixelScroll=[0, 0];
                    this.owncanvas.style.top='0px';
                    this.owncanvas.style.left='0px';


   		    this.repaintOwnNeeded=false;
                    var w=this.__width;
                    var h=this.__height;
                    var ctx=this.owncanvas.getContext('2d');
                    var me=this.ownmechObject;
                    var p=this.ownmech.position;
                    ctx.clearRect(0,0,w,h);
                    if (!p) return;
                    var mapPos=p.mapXY();
                    var age=(new Date()) - this.__ownmech_stamp;
                    if (this.options.extrapolate && age >0 && age < 2000 && this.options.zoom > 20 && me.speed != 0) { // Also not while jumping, moving lateral, .. but flags='' would be too much.
                      var dist=me.speed * age / MAGIC_SPEED_CONSTANT;
//                      console.log("interpolate",mapPos,'+',me.speed,'=(',dist,') in',me.heading/Math.PI*180.0);
                      
                      mapPos[0]+=dist * Math.cos(me.heading - Math.PI/2.0);
                      mapPos[1]+=dist * Math.sin(me.heading - Math.PI/2.0);
                      // TODO: Don't do that if ownContact is outside the visible area!
                      // set flag here, maybe unset after checking pixelPos, queue at end.
                      this.queueOwnRepaint(75);
                    }
                    var pixelPos=this._pixelPos(mapPos);
                    pixelPos[0] -= this.options.scrollX;
                    pixelPos[1] -= this.options.scrollY;
		    ctx.fillStyle='green';
		    ctx.font='22px Arial,sans-serif';
		    ctx.textBaseline='middle';
		    ctx.textAlign='center';
      	           ctx.fillText(me.id,pixelPos[0], pixelPos[1]);

                   /// Begin Scaled/Deformed paint
                   ctx.save();
                   ctx.translate(pixelPos[0], pixelPos[1]);
                   ctx.scale(1,this.muxToScreenY/this.muxToScreenX);
                   
                   
                   // ARCs depend on unit type, TODO: implement more.
                   // forward arc
                   ctx.fillStyle='rgba(0,200,0,0.2)';
                   ctx.beginPath();
                   ctx.moveTo(0,0);
                   ctx.arc(0, 0, this.options.zoom*3, 
                       me.heading - Math.PI/2.0 - Math.PI/3.0, me.heading - Math.PI/2.0 + Math.PI/3.0);
                   ctx.closePath();
                   ctx.fill();


      	           // Direction indicator:
      	           ctx.strokeStyle='rgb(20,50,10)';
      	           ctx.lineWidth=2;
      	           var s=me.speed;
      	           if (s>=0 && s < 15) s=15;
                   ctx.beginPath();
                   ctx.moveTo(0, 0);
                   ctx.lineTo(s * Math.cos(me.heading - Math.PI/2.0),
                              s * Math.sin(me.heading - Math.PI/2.0));
                   ctx.stroke();
                   
                   // Wanted direction
                   if (me.desiredHeading!==null && Math.abs(me.desiredHeading-me.heading) > 0.04) {
                    ctx.strokeStyle='rgb(130,20,150)';
                    ctx.lineWidth=1.3;
                    s=s*0.75;
                     ctx.beginPath();
                     ctx.moveTo(0, 0);
                     ctx.lineTo(s * Math.cos(me.desiredHeading - Math.PI/2.0),
                                s * Math.sin(me.desiredHeading - Math.PI/2.0));
                     ctx.stroke();
                   }
      	           
      	           // If type:Tank (Or anything with turret), show turret heading!
      	           if (me.hasTurret && me.hasTurret()) {
      	             if (me.turret!==null /*&&  Math.abs(me.turret-me.heading) > 0.04*/) {
      	               
                       ctx.strokeStyle='rgb(30,20,250)';
                       ctx.lineWidth=1.5;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(30 * Math.cos(me.heading+me.turret + Math.PI/2.0), // Do I need to understand why I get -3.1415 for Turret offset=0?
                                   30 * Math.sin(me.heading+me.turret + Math.PI/2.0));
                        ctx.stroke();
      	             }
      	           }
      	           
      	           
      	           
      	           ctx.restore();
      	           /// END Scaled/Deformed paint
      	           
                 },

                 /// CONTACTS
 	         paintContacts: function() { 

 	           // only in use during live-scroll to reduce ghosting. reset on redraw
     	            this.contactsCanvasPixelScroll=[0, 0];
                    this.contactscanvas.style.top='0px';
                    this.contactscanvas.style.left='0px';
                    
                    var now=new Date();
                    var w=this.contactscanvas.width;
                    var h=this.contactscanvas.height;
                    var ctx=this.contactscanvas.getContext('2d');
                    ctx.clearRect(0,0,w,h);

		    ctx.font='22px Arial,sans-serif';
		    
		    var extrapolatePossible=0;
                    this.contacts.forEach((function(me) {
                      var mapPos=me.position.mapXY();
                      var thisWasExtrapolated=false;
                      var age=now-me.lastLOS;
                      if (this.options.extrapolate && age > 0 && age < 2000 && this.options.zoom > 20 && me.speed != 0) { // Also not while jumping, moving lateral, .. but flags='' would be too much.
                        var dist=me.speed * age / MAGIC_SPEED_CONSTANT;
 //                      console.log("interpolate",mapPos,'+',me.speed,'=(',dist,') in',me.heading/Math.PI*180.0);

                        if (dist > 0.01) { // try to avoid jitter? TODO: Check value, maybe depending on zoom
                          mapPos[0]+=dist * Math.cos(me.heading - Math.PI/2.0);
                          mapPos[1]+=dist * Math.sin(me.heading - Math.PI/2.0);
                        }
                        extrapolatePossible++;
                        thisWasExtrapolated=true;
                       }

                       var txt='['+me.id+']';
                       if (me.name) txt+=' '+me.name;
                       var wid=ctx.measureText(txt).width+4;
                       var boxHW=20; // Half-Size of the box we want to draw if contact outside screen
                       var boxHH=15;

                       var pixelPos=this._pixelPos(mapPos);
                       pixelPos[0] -= this.options.scrollX;
                       pixelPos[1] -= this.options.scrollY;
                       
                       
                       if (pixelPos[0] > boxHW && pixelPos[0] < w-boxHW &&
                           pixelPos[1] > boxHH && pixelPos[1] < h-boxHH) { // Inside usefull screen area?
                           
                         ctx.fillStyle='rgba(160,160,160,0.4)';
                         ctx.strokeStyle='rgb(100,100,100)';
                         ctx.lineWidth=1;
                         ctx.beginPath();
                         ctx.rect(pixelPos[0]-2, pixelPos[1]-1,wid,24);
                         ctx.fill();
                         ctx.stroke();

                         if (me.id==me.id.toLowerCase()) {
                           ctx.fillStyle='green';
                         } else { 
                           ctx.fillStyle='red';
                         } 

                        ctx.font='22px Arial,sans-serif';
  		        ctx.textBaseline='top';
		        ctx.textAlign='left';
                        ctx.fillText(txt,pixelPos[0], pixelPos[1]);

                       /// Begin Scaled/Deformed paint
                        ctx.save();
                        ctx.translate(pixelPos[0], pixelPos[1]);
                        ctx.scale(1,this.muxToScreenY/this.muxToScreenX);
                        
                       // Direction indicator:
                         var s=me.speed;
                         ctx.strokeStyle='rgb(50,20,10)';
                         ctx.lineWidth=2;
                         if (s>=0 && s < 10) s=10;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(s * Math.cos(me.heading - Math.PI/2.0),
                                   s * Math.sin(me.heading - Math.PI/2.0));
                        ctx.stroke();
                        
                        // Undo deformation
                        ctx.restore();

                      } else {
                        // Not in Mapview. paint direction marker instead.
                        // start with a virtual line from map display center to contact
			var cent=[w/2,h/2];


			var       pos=_lineIntersection([0,boxHH],  [w,boxHH],  cent,pixelPos); // Top line
			if (!pos) pos=_lineIntersection([0,h-boxHH],[w,h-boxHH],cent,pixelPos); // Bottom Line
			if (!pos) pos=_lineIntersection([boxHW,0],  [boxHW,h],  cent,pixelPos); // Left Line
			if (!pos) pos=_lineIntersection([w-boxHW,0],[w-boxHW,h],cent,pixelPos); // right Line
			if (!pos) {
			  console.log("Follow this line, it leads to never-neverland",cent,pixelPos);
			  return;
                        }

  		         ctx.font='16px Arial,sans-serif';
 		         ctx.textBaseline='middle';
		         ctx.textAlign='center';
		         ctx.fillStyle='rgba(140,140,140,0.5)';
                         ctx.strokeStyle='rgb(100,100,130)';
                         ctx.beginPath();
                         ctx.rect(pos[0]-boxHW, pos[1]-boxHH,boxHW*2,boxHH*2);
                         ctx.fill();
                         ctx.stroke();
                         if (me.id==me.id.toLowerCase()) {
                           ctx.fillStyle='green';
                         } else { 
                           ctx.fillStyle='red';
                         } 
			 ctx.fillText('['+me.id+']',pos[0], pos[1]);
                      // also: don't interpolate
                       if (thisWasExtrapolated) extrapolatePossible--;
                      }

                    }).bind(this));

   		    this.repaintContactsNeeded=false;
   		    if (extrapolatePossible) {
//      console.log("extrapolating contacts for ",extrapolatePossible);
     		      this.queueContactsRepaint(80);
                    }
                 },


                 /// MAP-Painting (Outsource this function to a Style-Lib?)
                 // x,y: Canvas-Position,
                 // hex: two-letter-field data
                 // mx,my : MUX-Hex-Coordinates
                 // cliffXX: Bool if there's a cliff between this and the N/NW/SW hex
                 _drawHex: function(ctx,x,y,hex,mx,my,cliffN,cliffNW,cliffSW) {
                   ctx.beginPath();
                   ctx.moveTo(x,y+this.halfHexHeight);
                   ctx.lineTo(x+this.fourthHexWidth,y);
                   ctx.lineTo(x+this.hexWidth,y);
                   ctx.lineTo(x+this.fullHexWidth,y+this.halfHexHeight);
                   ctx.lineTo(x+this.hexWidth,y+this.hexHeight);
                   ctx.lineTo(x+this.fourthHexWidth,y+this.hexHeight);
                   ctx.closePath();
                   if (this.options.zoom > 12) ctx.stroke(); 
                   var fs=this.__style.hexcolors[hex];
                   if (!fs) fs=this.__style.hexcolors[hex[0]+'?'];
                   if (!fs) fs=this.__style.hexcolors['??'];
                   ctx.fillStyle=fs;
                   ctx.fill();
                   
                   if (this.options.zoom < 20) {
                     // skip all the eyecandy for lower zoom levels
                     return;
                   }

                   // Paint texture
                   /// TODO.
                    

                   // paint Cliffs
                   if (cliffN || cliffNW || cliffSW) {
                     var oldCol=ctx.strokeStyle;
                     var oldWid=ctx.lineWidth; // TODO: Benchmark if this is faster than save()/restore();
                     ctx.strokeStyle='rgba(240,70,70,0.8)';
                     ctx.lineWidth=3;
                     if (cliffN) {
                       ctx.beginPath();
                       ctx.moveTo(x+this.fourthHexWidth,y);
                       ctx.lineTo(x+this.hexWidth,y);
                       ctx.stroke();
                     }
                     if (cliffNW) {
                       ctx.beginPath();
                       ctx.moveTo(x,y+this.halfHexHeight);
                       ctx.lineTo(x+this.fourthHexWidth,y);
                       ctx.stroke();
                     }
                     if (cliffSW) {
                       ctx.beginPath();
                       ctx.moveTo(x,y+this.halfHexHeight);
                       ctx.lineTo(x+this.fourthHexWidth,y+this.hexHeight);
                       ctx.stroke();
                     }

                     
                     ctx.strokeStyle=oldCol;
                     ctx.lineWidth=oldWid;
                   }

                   
                   // text color depending on color used for background.
                   // simple hack: darker colors have shorter string :)
                   if (fs.length <= 13) {
                     ctx.fillStyle='white';
                   } else { 
                     ctx.fillStyle='black'; 
                   }
                   ctx.fillText(hex,x+this.hexWidth,y+this.hexHeight);
                   
                   // Draw HEX number if zoomed all the way in
                   if (this.options.zoom > 75) {
                     ctx.textBaseline='top';
                     ctx.textAlign='left';

                     ctx.fillText(mx+" "+my,x+this.fourthHexWidth+2,y+3);
 
                     ctx.textBaseline='bottom';
                     ctx.textAlign='right';
                   }
                 },
 	         paintMap: function() { 
                    var w=this.mapcanvas.width;
                    var h=this.mapcanvas.height;
                    var lw=w-this.hexWidth; // avoid painting part of hexes. we have enough overlap.
                    var lh=h-this.halfHexHeight; 
                    var me=this.ownmechObject;
                    // See if we need to shift mapOffset
                     var xOverscroll=w - this.__width - this.mapCanvasPixelScroll[0];
                     var yOverscroll=h - this.__height - this.mapCanvasPixelScroll[1];

                    var xneeded=0;
                    var yneeded=0;
                    // the +1 / -1 are for scrolling a bit more in preparation for the current move direction
                    if (xOverscroll < this.fourthHexWidth) {
                      xneeded=Math.ceil((this.fourthHexWidth - xOverscroll)/ this.hexWidth) + 1;
                    } else if (this.mapCanvasPixelScroll[0] < this.fourthHexWidth && this.mapOffset[0]>0) {
                      xneeded=Math.floor((this.mapCanvasPixelScroll[0]-this.fourthHexWidth)/ this.hexWidth) - 1; 
                    }
                    
                    if (yOverscroll < this.halfHexHeight) { //
                      yneeded=Math.ceil((this.halfHexHeight - yOverscroll)/ this.hexHeight) + 1;
                    } else if (this.mapCanvasPixelScroll[1] < this.halfHexHeight && this.mapOffset[1]>0) {
                      yneeded=Math.floor((this.mapCanvasPixelScroll[1] - this.halfHexHeight) / this.hexHeight) - 1;
                    }
                    
                    if (xneeded || yneeded) {
//                      console.log("need mapshift (",xneeded,',',yneeded, ")");
                      this.mapCanvasPixelScroll[0]-=xneeded * this.hexWidth;
                      this.mapOffset[0]+=xneeded;
                      this.mapCanvasPixelScroll[1]-=yneeded * this.hexHeight;
                      this.mapOffset[1]+=yneeded;
                      this.mapcanvas.style.top=(-this.mapCanvasPixelScroll[1])+'px';
                      this.mapcanvas.style.left=(-this.mapCanvasPixelScroll[0])+'px';

                      // TODO: Why do we redraw these on mapshift? they have their own canvas+offset, 
                      // and their redraw is triggered by scroll()!
                      // this.queueOwnRepaint(10); // or call immediately afterwards?
                      // this.queueContactsRepaint(11);
                    }
                      
                    
                    var ctx=this.mapcanvas.getContext('2d');
                    ctx.clearRect(0,0,w,h);

                    if (this.options.zoom > 100) {
   	              ctx.font='16px sans-serif'; 
                    } else if (this.options.zoom > 70) {
   	              ctx.font='14px sans-serif'; 
                    } else if (this.options.zoom > 40) {
   	              ctx.font='13px sans-serif'; 
                    } else if (this.options.zoom > 25) {
                       ctx.font='11px sans-serif';
                    } else {
   	              ctx.font='9px sans-serif'; 
                    }
   	            ctx.textBaseline='bottom';
                    ctx.textAlign='right';

   	            var mapX=this.mapOffset[0];
                    for (var x=0; x < lw; x+=this.hexWidth,mapX++) {
                      var mapY=this.mapOffset[1]; 
   	              for (var y=0+((mapX+1)%2)*this.halfHexHeight; y < lh; y+=this.hexHeight,mapY++) {
   	                if (mapX>=0 && mapY>=0 && mapX < this.mapdata.width && mapY < this.mapdata.height) { 
   	                 var hex=this._getHex(mapX,mapY);
   	                 var cN=false;
   	                 var cNW=false;
   	                 var cSW=false;
   	                 if (this.options.zoom >= 20 && me && me.position && me.isCliff) {
   	                    var hexN=this._getHex(mapX,mapY-1);
   	                    var hexNW=this._getHex(mapX-1,(mapX%2)?(mapY-1):mapY);
   	                    var hexSW=this._getHex(mapX-1,(mapX%2)?mapY:(mapY+1));
   	                    cN=me.isCliff(hex,hexN);
   	                    cNW=me.isCliff(hex,hexNW);
   	                    cSW=me.isCliff(hex,hexSW);
   	                 }
                         this._drawHex(ctx,x,y,hex,mapX,mapY,cN,cNW,cSW);
                        }
   	              
   	              }
   	            }
   	            
   		    this.repaintMapNeeded=false;
   		    
   		    
                 },
                 
                 _getHex: function(mapX,mapY) {
                   var mapline=this.mapdata.map[mapY];
                   if (typeof mapline!= 'string') mapline='';
                   var hex=mapline.slice(mapX*2,mapX*2+2);
                   if (hex.length != 2) hex='??';
                   return hex;
                 },


 	         paintLegend: function() { 
                    var w=this.legendcanvas.width;
                    var h=this.legendcanvas.height;
                    var ctx=this.legendcanvas.getContext('2d');
                    ctx.clearRect(0,0,w,h);

		    ctx.font='12px Arial,sans-serif';
		    ctx.textBaseline='top';
		    ctx.textAlign='center';
		    var bg='rgba(170,170,180,0.8)';
		    var fg='rgb(30,60,70)';
		    var textmess=ctx.measureText('999');
  		    var hTW=Math.ceil(textmess.width/2)+2;
                    var fTW=hTW*2;
  		    var fTH=14;// textmess.height+2;
  		    var hTH=7;

		    // x axis
  		    var xHStep=Math.ceil(hTW*3/this.hexWidth); // At least 1/2 marker width distance
  		    var xStep=this.hexWidth*xHStep;

		    var startXHex=Math.floor((this.options.scrollX + hTW*2)  / this.hexWidth);
		    var startXPx= startXHex* this.hexWidth - this.options.scrollX + this.halfHexWidth;
		    for (var x=startXPx; x < w; x+=xStep,startXHex+=xHStep) {
		      ctx.beginPath();
		      ctx.moveTo(x-hTW,0);
		      ctx.lineTo(x-hTW,fTH);
		      ctx.lineTo(x,fTH+5);
		      ctx.lineTo(x+hTW,fTH);
		      ctx.lineTo(x+hTW,0);
		      ctx.stroke();
		      ctx.closePath();
    	              ctx.fillStyle=bg;
		      ctx.fill();
		      ctx.fillStyle=fg;
		      ctx.fillText(startXHex,x,0);
                    }

		    ctx.textBaseline='middle';
		    ctx.textAlign='right';

		    // y axis
  		    var yHStep=Math.ceil(fTH*3/this.hexHeight); // At least 1/2 marker height distance
  		    var yStep=this.hexHeight*yHStep;

		    var startYHex=Math.floor((this.options.scrollY + fTH*2 + this.halfHexHeight/2)  / this.hexHeight);
		    var startYPx= startYHex* this.hexHeight - this.options.scrollY + this.halfHexHeight*1.5;
		    for (var y=startYPx; y < h; y+=yStep,startYHex+=yHStep) {
		      ctx.beginPath();
		      ctx.moveTo(0,y-hTH);
		      ctx.lineTo(fTW,y-hTH);
		      ctx.lineTo(fTW+3,y);
		      ctx.lineTo(fTW,y+hTH);
		      ctx.lineTo(0,y+hTH);
		      ctx.stroke();
		      ctx.closePath();
    	              ctx.fillStyle=bg;
		      ctx.fill();
		      ctx.fillStyle=fg;
		      ctx.fillText(startYHex,fTW-2,y);
                    }


   		    this.repaintLegendNeeded=false;
                 },



                 // Map navigation
                 // Use mousedown or click?
                 __mapMouseClick : function(e) {
                   // TODO: doesn't work with new firefox. Click event only is sent on left button(which==1)
                    return;
                 },

                 __mapMouseUp : function(e) {
                   if (e.which==2 || (e.which==1 && e.shiftKey)) {
                     e.preventDefault();
                     if (!this.ownmech.position) return; // We don't know where we are!
                     var clickpos=this._mapPos([e.offsetX + this.options.scrollX,  e.offsetY + this.options.scrollY]);
                     var ownpos=this.ownmech.position.mapXY();
                     var difx=ownpos[0]-clickpos[0];
                     var dify=ownpos[1]-clickpos[1];
                     var ang=Math.round((Math.atan2(dify,difx) - Math.PI/2.0)*180.0 / Math.PI);
                     while (ang < 0) { ang += 360; }
 //                    console.log("Middle click on", clickpos, "while we are at ",ownpos,"so the wanted heading is",ang);
                     this.element.trigger('send','heading '+ang);
                     // trick for showing heading earlier. bugs out on stationary units, but that will be fixed next GS
                     this.ownmech.desiredHeading=ang/180.0 * Math.PI;
                     this.queueOwnRepaint();
                     
                   }
//                    if (e.which==2) { e.preventDefault(); /* prevent middle click from being interpreted as "paste current selection" on linux */ }
                 },

                 __mapContext : function(e) {
                   e.preventDefault();
                   if (!this.ownmech.position) return; // We don't know where we are!
                   var clickpos=this._mapPos([e.offsetX + this.options.scrollX,  e.offsetY + this.options.scrollY]);
                   var ownpos=this.ownmech.position.mapXY();
                   console.log("Context Menu for click @",clickpos,"while mech is at",ownpos);
                 },

                 __mapMouseDown : function(e) {
                 // currently unused.
                 },
                 
                 __mapMouseDblClick  : function(e) {
                    if (e.which==1) { // left btn dblclic
                      e.preventDefault();
                     if (!this.ownmech.position) return; // We don't know where we are!
                     var clickpos=this._mapPos([e.offsetX + this.options.scrollX,  e.offsetY + this.options.scrollY]);
                     var ownpos=this.ownmech.position.mapXY();
                     var difx=ownpos[0]-clickpos[0];
                     var dify=ownpos[1]-clickpos[1];
                     var ang=Math.round((Math.atan2(dify,difx) - Math.PI/2.0)*180.0 / Math.PI);
                     while (ang < 0) { ang += 360; }
                     var len=Math.round(Math.sqrt(difx*difx+dify*dify));
//                     console.log("hudinfo t 30 "+ang+" "+len);
                     this.element.trigger('send',"hudinfo t 30 "+ang+" "+len);
                    }
                 
                 },
                 
                 __mapMouseWheel : function(e) {
//                   console.log("scrollBy",e.deltaY);
                     // I want about 20++ zoomlevels, mapped [20..200] in quadradic manner.. adjust scaler to change
                    
                     var scaler=4.5;
                     var z=this.options.zoom;
                     var nZ=Math.sqrt(z*scaler)+e.deltaY;
                     nZ=Math.round(nZ*nZ/scaler);
//                     console.log("zoomChange",z,"=>",nZ," with center at ",[e.offsetX, e.offsetY]);
                     this.zoom(nZ,[e.offsetX, e.offsetY]);
                   e.preventDefault();
                 },
                 
                 // Mouse drag-n-scroll
                 
                 _mouseStart: function(e) {
//                   console.log("mouseStart(",event);
                   this.startDragX=e.pageX;
                   this.startScrollX=this.options.scrollX;
                   this.startDragY=e.pageY;
                   this.startScrollY=this.options.scrollY;
                 },
                 _mouseStop: function(e) {
//                     console.log("mouseStop(",event);
                     this.startDragX=null;
                     this.startDragY=null;
                     this.startScrollX=null;
                     this.startScrollY=null;
                  },
                 _mouseDrag: function(e, noPropagation) {
//                     console.log("mouseDrag(",event, noPropagation);
                     this.scroll(this.startScrollX - e.pageX + this.startDragX,
                                 this.startScrollY - e.pageY + this.startDragY);
                 }
	});
})( jQuery, window, document );