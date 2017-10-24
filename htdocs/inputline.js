;(function ( $, window, document, undefined ) {
        $.widget( "xpert.inputline" , {
                defaultElement: "<input>",
                 options : {
                    prefix: '',
                    history: 50
                  },
                  _create: function () {
                        this.element.addClass('xmud-inputline');
                        this._on(this.element,this._handleEvents);
                        this.__history=[];
                        this.__historyPos=-1;
                  },

                  _enter: function _enter() {
                    var val=this.element.val();
                    this.element.val('');
                    this.element.trigger('send',val);
//                    this._trigger('send',null,val);
        
                    // add to history:
                    this.__history.unshift(val);
                    this.__historyPos=-1;
                    while (this.__history.length > this.options.history) {
                      this.__history.pop();
                    }
                  },
                  _history: function hist(dir) {
                      this.__historyPos+=dir;
                      if (this.__historyPos<0) {
                        this.__historyPos=0;
                        return;
                      }
                      if (this.__historyPos>=this.__history.length) {
                        this.__historyPos=this.__history.length-1;
                        return;
                      }
                      var val=this.__history[this.__historyPos];
                      this.element.val(val).select();
                  },
                  __reFocus: function() {
                    this.__focusTimeout=null;
                    this.element.focus();
                  },

		_handleEvents: {
              
			"blur":function() { 
			  if (!this.__focusTimeout) {
   			   this.__focusTimeout=setTimeout(this.__reFocus.bind(this), 5000);
                          }
                        },
                        "keydown":function(e) {
                            var K=$.ui.keyCode;
                             if (e.which == K.ENTER) {
                                 e.preventDefault();
                                 this._enter();
                             } else if (e.which == K.UP) {
                               e.preventDefault();
                               this._history(1);
                             } else if (e.which == K.DOWN) {
                               e.preventDefault();
                               this._history(-1);
                             }
			}
		}

        });
})( jQuery, window, document );
        