/* 
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/

;(function ( $, window, document, undefined ) {
	$.widget( "xpert.textView" , {	
	          options : {
	              scrollback: 100, // Buffer to keep
	              scrollstep: 10, // Lines to remove in one step
	              fontsize : 15,
	              autoscroll: true
	          },
		  _create: function () {
		  	this.element.addClass('xmud-textview ansi-color');
		  	this.element.css('font-size',this.options.fontsize+'px');
		  	this.lineCount=0;
		  	this.newLine();
		  },
		  _destroy: function () {
		  	console.log("xpert.textView.destroy");
		  },
                  _setOption: function ( key, value ) {
                    if (key=='fontsize') {
                      this.element.css('font-size',value+'px');
                    }
                    return this._super( key, value );
		  },
		  appendLine: function(line) {
		    if (!$.isArray(line)) { line=[line]; }
		    var state=[];
		    var that=this;
		    line.forEach(function(ele) {
		      if ($.isArray(ele)) {
		        state=ele;
		      } else {
		        that.appendText(ele,state);
		      }
		    });
		    this.newLine();
                 },
    		 appendText: function(text,color) {
//			console.log("xpert.textView.appendText",text);
                  if ($.isArray(color)) {
                    color=color.join(' ');
                  }
                  if (!color) {
                    color="";
                  }
                  if (color != this.currentStyles) {
//                    console.log("Colors changed from "+this.currentStyles+" to "+color);
                    
                    this.currentStyles=color;
                    this.currentSpan=$('<span></span>').addClass(color).appendTo(this.currentLine);
                  }
                  if (this.currentSpan) {
                    this.currentSpan.append(text); 
                  } else {
                    this.currentLine.append(text);
                  }
		},
		newLine: function() {
		   this.currentStyles="";
		   this.currentSpan=null;
  	  	   this.currentLine=$('<div class="xm-line"></div>').appendTo(this.element);
  	  	   this.lineCount++;
  	  	   // Remove old scroll
  	  	   if (this.lineCount > this.options.scrollback + this.options.scrollstep) {
  	  	     this.element.children('.xm-line').slice(0,this.options.scrollstep).remove();
  	  	     this.lineCount-=this.options.scrollstep;
//  	  	     console.log("LC :" , this.lineCount, " vs ", this.element.children('.xm-line').length);
  	  	   }
  	  	   if (this.options.autoscroll && this.currentLine.position().top - this.element.height()  < 100) { 
     	  	     this.element.scrollTop(this.lineCount*100+10000); // blahblah...
                   }
		},
		scrollUp: function(am) {
		  if (typeof am != 'number' || am < 1) am=1;
		  this.element.scrollTop(this.element.scrollTop()-150*am);
		},
		scrollDown: function(am) {
		  if (typeof am != 'number' || am < 1) am=1;
		  this.element.scrollTop(this.element.scrollTop()+150*am);
		}

	});
})( jQuery, window, document );