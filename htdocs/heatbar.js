/* 
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/

;(function ( $, window, document, undefined ) {
	$.widget( "xpert.heatbar" , {	
	          options : {
	          },
		  _create: function () {
		  	this.element.addClass('xmud-heatbar');
		  	this.canvas=$('<canvas></canvas>')[0];
		  	this.canvas.width=this.element.innerWidth();
		  	this.canvas.height=this.element.innerHeight();
		  	this.element.append(this.canvas);
		  	this.repaintNeeded=true;
		  	this.data={
		  	    heat:0,
		  	    heatDissipation:0
		  	};
		  	this.__lastStamp=new Date();
 	  	        this.__checkIval=setInterval(this.checkSize.bind(this),1313);
		  },
		  _destroy: function () {
		  	console.log("xpert.heatbar.destroy");
		  	clearIval(this.__checkIval);
		  },
                  checkSize: function() { // TODO: Also in interval
                    if (this.element.innerWidth()>0 && this.element.innerHeight()>0 && 
                        (this.canvas.width  != this.element.innerWidth() ||
                         this.canvas.height != this.element.innerHeight())) {  
                        this.canvas.width=this.element.innerWidth();
                        this.canvas.height=this.element.innerHeight();
                        this.repaintNeeded=true;
                        setTimeout(this.paint.bind(this),10);
                    }
                  },
		  updateInfo: function updateInfo(mech) {
		    $.each(this.data, (function(key,olddata) {
		      if (mech[key] != null && mech[key] != olddata) {
                        this.data[key]=mech[key];
                        this.repaintNeeded=true;
                        if (key=='heat') this.__lastStamp=new Date(); // we often get dummy updates repeating the same heat as last second

		      }
		    }).bind(this));
		    if (this.repaintNeeded) {
		      setTimeout(this.paint.bind(this),10);
		    }
		  },
		  paint: function() {
//		    console.log("Heatbar paint");
		    var hD=this.data.heatDissipation;
		    
		    var heat=this.data.heat;
		    var age=(new Date()) - this.__lastStamp;
		    
		    if (age > 0 && age < 3000 && heat > 20) {
		      // in 60 seconds we loose "hD"*10 heat
		      heat -= (age / 60000)*hD;
//		      console.log("interpolate heat ",this.data.heat,"->",heat,"after",(age/1000),"seconds");
 	              setTimeout(this.paint.bind(this),100);
		    }
		    
                    var maxHeat=Math.max(10,heat,hD+350);
                    var w=this.canvas.width;
                    var h=this.canvas.height;
                    if (h==0) return;
                    var scale=(h-10)/(maxHeat);
                    var zeroPos=maxHeat*scale+5;
                    var ctx=this.canvas.getContext('2d');

                    var grd=ctx.createLinearGradient(0,0,0,h);
                    grd.addColorStop(0,'#FA5');

                    grd.addColorStop((zeroPos-(hD+250)*scale)/h,'#A30');

                    grd.addColorStop((zeroPos-(hD+190)*scale-10)/h,'#920');
                    grd.addColorStop((zeroPos-(hD+190)*scale+10)/h,'#8B0');

                    // To yellow
                    grd.addColorStop((zeroPos-(hD+140)*scale-10)/h,'#7C0');
                    grd.addColorStop((zeroPos-(hD+140)*scale+10)/h,'#0D0');

                    // to bright green
                    grd.addColorStop((zeroPos-(hD+90)*scale-10)/h,'#0C0');
                    grd.addColorStop((zeroPos-(hD+90)*scale+10)/h,'#080');

                    // grey to green                    
                    grd.addColorStop((zeroPos-hD*scale-10)/h,'#060');
                    grd.addColorStop((zeroPos-hD*scale)/h,'#666');
                    
                    grd.addColorStop(1,'#777');
                    ctx.fillStyle=grd;
                    ctx.fillRect(0,0,w,h);
                    
                    ctx.fillStyle="#555";
                    ctx.lineWidth=1.7;
                    ctx.beginPath();
                    ctx.moveTo(w/3.0,h);
                    ctx.lineTo(w/3.0,(zeroPos - heat*scale));
                    ctx.lineTo(w/3.0*2.0,(zeroPos - heat*scale));
                    ctx.lineTo(w/3.0*2.0,h);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.fill();
/*
		    ctx.fillStyle='black';
		    ctx.font='12px Arial,sans-serif';
		    ctx.textBaseline='middle';
		    ctx.textAlign='center';
		    function drawTick(pos) {
		      var y=Math.round(zeroPos-pos*scale);
		      ctx.beginPath();
		      ctx.moveTo(0,y);
		      ctx.lineTo(w/5.0,y);
		      ctx.moveTo(w/5.0*4.0,y)
		      ctx.lineTo(w,y);
		      ctx.stroke();
		      ctx.fillText(Math.round(pos),w/2.0,y);
		    }
		    drawTick(this.data.runSpeed);
		    drawTick(this.data.walkSpeed);
		    drawTick(0);
		    drawTick(this.data.backSpeed);
*/
 		    this.repaintNeeded=false;
                 }
	});
})( jQuery, window, document );