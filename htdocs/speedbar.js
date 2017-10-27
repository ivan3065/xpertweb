"use strict";
/* 
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/

/*
   widget showing current speed, walk/flank/back
   TODO: Add mouseclick handler, change speed by click.
*/
;(function ( $, window, document, undefined ) {
	$.widget( "xpert.speedbar" , {	
	          options : {
	          },
		  _create: function () {
		  	this.element.addClass('xmud-speedbar');
		  	this.canvas=$('<canvas></canvas>')[0];
		  	this.canvas.width=this.element.innerWidth();
		  	this.canvas.height=this.element.innerHeight();
		  	this.element.append(this.canvas);
		  	this.repaintNeeded=true;
		  	this.data={
		  	    speed:0,
		  	    desiredSpeed:0,
		  	    walkSpeed:0,
		  	    runSpeed:0,
		  	    backSpeed:0
		  	};
		  	this.__checkIval=setInterval(this.checkSize.bind(this),1123);
		  },
		  _destroy: function () {
		  	console.log("xpert.speedbar.destroy");
		  	clearInterval(this.__checkIval);
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
		      }
		    }).bind(this));
		    if (this.repaintNeeded) {
		      setTimeout(this.paint.bind(this),100);
		    }
		  },
		  paint: function() {
//		    console.log("Speedbar paint");
                    var maxSpeed=Math.max(0,this.data.speed,this.data.desiredSpeed,this.data.walkSpeed,this.data.runSpeed)+5;
                    var minSpeed=Math.min(0,this.data.speed,this.data.desiredSpeed,this.data.backSpeed)-5;
                    var w=this.canvas.width;
                    var h=this.canvas.height;
                    if (h==0) return;
                    var scale=(h-10)/(maxSpeed-minSpeed);
                    var zeroPos=maxSpeed*scale+5;
                    var ctx=this.canvas.getContext('2d');
//                    ctx.clearRect(0,0,w,h);
                    var grd=ctx.createLinearGradient(0,0,0,h);
                    grd.addColorStop(0,'#FA0');
                    grd.addColorStop((zeroPos-this.data.runSpeed*scale-10)/h,'#EB0');
                    grd.addColorStop((zeroPos-this.data.runSpeed*scale+10)/h,'#FC0');

                    grd.addColorStop((zeroPos-this.data.walkSpeed*scale-10)/h,'#FB0');
                    grd.addColorStop((zeroPos-this.data.walkSpeed*scale+10)/h,'#8B0');

                    grd.addColorStop((zeroPos-10)/h,'#8A0');
                    grd.addColorStop((zeroPos+10)/h,'#2AA');
                    
                    grd.addColorStop((zeroPos-this.data.backSpeed*scale-10)/h,'#2AA');
                    grd.addColorStop((zeroPos-this.data.backSpeed*scale+10)/h,'#0AE');
                    
                    grd.addColorStop(1,'#0AF');
                    ctx.fillStyle=grd;
                    ctx.fillRect(0,0,w,h);
		    
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
		    
		    

		    var desY=zeroPos - this.data.desiredSpeed*scale;
		    ctx.fillStyle='#CCC';
		    ctx.beginPath();
		    ctx.moveTo(w,desY-6);
		    ctx.lineTo(w/5.0*3.0,desY-6);
		    ctx.lineTo(w/5.0*3.0-6,desY);
		    ctx.lineTo(w/5.0*3.0,desY+6);
		    ctx.lineTo(w,desY+6);
		    ctx.stroke();
		    ctx.closePath();
		    ctx.fill();
		    ctx.textAlign='end';
		    ctx.fillStyle='black';
		    ctx.fillText(Math.round(this.data.desiredSpeed),w-2,desY);

		    
		    var curY=zeroPos - this.data.speed*scale;
		    ctx.fillStyle='#AAA';
		    ctx.beginPath();
		    ctx.moveTo(0,curY-7);
		    ctx.lineTo(w/4.0*2.0,curY-7);
		    ctx.lineTo(w/4.0*2.0+7,curY);
		    ctx.lineTo(w/4.0*2.0,curY+7);
		    ctx.lineTo(0,curY+7);
		    ctx.stroke();
		    ctx.closePath();
		    ctx.fill();
		    ctx.textAlign='start';
		    ctx.fillStyle='black';
		    ctx.fillText(Math.round(this.data.speed),2,curY);
		    
		    
 		    this.repaintNeeded=false;
                 }
	});
})( jQuery, window, document );