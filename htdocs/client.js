'use strict';
/* 
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/


// This is only safe for HTML inserted as content, not as tag attributes!
// Only used for command echo, so it's more or less safe userinput anyhow.
var simpleHTMLEscape=(function() {
  var _entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };
  function _mapLookup(s) {
      return _entityMap[s];
  }
  return function escapeHtml(inp) {
    return String(inp).replace(/[&<>]/g, _mapLookup);
  };
})();


// $('document').ready(function() {
$( window ).load(function() {
  window.location.hash='delaying startup';
   
   var storage={};
   if (window.localStorage) { storage=window.localStorage; }


   function getConfig(key) {
     var cfg={};
     if (typeof storage[key] == 'string') {
       try {
         cfg=JSON.parse(storage[key]);
       } catch(e) {}
       if (!$.isPlainObject(cfg)) {
         cfg={};
       }
     }
     return cfg;
   }   
   
   function setConfig(key,value) {
     storage[key]=JSON.stringify(value);
   }

   var textwindow=$('#textwidget').textView($.extend({scrollback:500},getConfig('textwidget')));
   window.location.hash='textwindow texted';
   var speedbar=$('#speedbar').speedbar();
   window.location.hash='speedbar fastened';
   var heatbar=$('#heatbar').heatbar();
   window.location.hash='heatbar preheated';
   var map=$('#map').mapview(getConfig('mapwidget'));
   window.location.hash='map mapped';
   var weapons=$('#weapons').weaponlist();
   window.location.hash='weapons primed';

   var inputline=$('#text').inputline();
   window.location.hash='awaiting input';

   $('#toolbox button').button({ disabled: true })
   $('#toolbox input[type=checkbox]').checkboxradio({ disabled: true, icon: false })
   




   
  setTimeout(function() {  // delay a bit after "loaded" event to stop spinning wheel of anoyance


   // Now connect websocket, try to auto-detect reverse.proxy setups.
   var socket;
   (function doConnect() {
     var l=document.location.pathname || '/';
     l=l.replace(/[^/]+$/g,'');
     l=l.replace(/\/\//,'/');
     if (l!='/') {
       l+='socket.io';
       console.log("Assuming reverse proxy, trying to access websocket at",l);
       socket = io.connect({path:l});
     } else {
       socket=io.connect();
     }
   })(); 



   // global keyboard handling
   $(document).keydown(function(e) {
     var K=$.ui.keyCode;
     switch (e.which) {
      case K.PAGE_UP:
        e.preventDefault();
        textwindow.textView("scrollUp");
        return;
      case K.PAGE_DOWN:
        e.preventDefault();
        textwindow.textView("scrollDown");
        return;
      case 117: // F6
       e.preventDefault();
       $('#btn-battle').trigger('click');
       return;
     };
     if (e.altKey && ! e.ctrlKey && ! e.shiftKey && ! e.metaKey) {
       if (e.which >=48 && e.which <= 57) {
         e.preventDefault();
         socket.emit("send",'sight '+(e.which-48));
         return;
       }
       else if (e.which==192 || e.which==160) {  e.preventDefault(); socket.emit("send",'sight 0'); return; }
       else if (e.which==18) { e.preventDefault(); return; } // pure alt key. prevent unwanted browser actions
       
       else console.log('alt ', e.which);
     } else if (! e.altKey && e.ctrlKey && ! e.shiftKey && ! e.metaKey) {
       var chr=String.fromCharCode(e.which);
       if (chr==="") return;
       if (e.which >=48 && e.which <= 57) {
         e.preventDefault();
         socket.emit("send",'fire '+(e.which-48));
         return;
       }
       else if (e.which==192 || e.which==160) {  e.preventDefault(); socket.emit("send",'fire 0'); return; }
       else if (chr=='Z') { e.preventDefault(); socket.emit("send",'speed 0'); return; }
       else if (chr=='M') { e.preventDefault(); socket.emit("send",'speed flank'); return; }
       else if (chr=='K') { e.preventDefault(); socket.emit("send",'kick'); return; }
       else if (chr=='P') { e.preventDefault(); socket.emit("send",'punch'); return; }
       else if (chr=='N') { e.preventDefault(); socket.emit("send",'navigate'); return; }
       else if (chr=='S') { e.preventDefault(); socket.emit("send",'status'); return; }
       else if (chr=='T') { e.preventDefault(); socket.emit("send",'tactical'); return; }
      // Don't break copy&paste else if (chr=='C') { e.preventDefault(); socket.emit("send",'contacts'); return; }
       else if (chr=='R') { e.preventDefault(); socket.emit("send",'range'); return; } // Mostly: prevent reload
       else if (e.which==17) { e.preventDefault(); return; } // pure ctrl key. prevent unwanted browser actions
       else console.log('ctrl ',chr, e.which);

     } else if (! e.altKey && ! e.ctrlKey && ! e.shiftKey && ! e.metaKey) {
       // No modifier... who wants the key?
       if (e.target==document.body) { 
          inputline.focus();
          // TODO: Check if that is enough for IE to re-route the event
          // Rumours say: IE changes focus asynchronously
//         console.log(e);
        }
     }
   
   });


   var HUD;


   textwindow.textView("appendLine",[
     ['f15','u'],"Welcome to ",['f9','u','i'],"Xpert",['f8','b'],"W",['f10','u'],"E",['faint','f12'],"B"
    ]);

   window.location.hash='greeted';

   inputline.on("send",function(event,t) {
    // TODO: If settings.CommandEcho :
        textwindow.textView("appendLine",[['f3','faint'],'» ',['userinput'],simpleHTMLEscape(t)]);
      socket.emit("send",t);
   });

   map.on("send",function(event,t) {
     socket.emit("send",t);
   });

    function hud_send(cmd) {
      if (this===HUD) {
        socket.emit("send",cmd);
      } else {
        // does that happen? Bad/forgotten timer?
        console.log(this,"!==",HUD," declining its output request");
      }
    }

    // not quite accurate state. Just to help the beforeunload-handler
    var MUXconnected=false;
   
    $('#btn-connect').click(function() {
       socket.emit('muxconnect',$.cookie('muxtoken'))
        MUXconnected=true;
    });
    
    $('#btn-disconnect').click(function() {
      socket.emit('muxdisconnect');
      MUXconnected=false;
      textwindow.textView("appendLine",[['f1','faint'],'» disconnected']);
      $.removeCookie('muxtoken');
      $('#btn-connect').button('enable');
      $('#btn-disconnect').button('disable'); 
    });      
    
   socket.on("connect", function() {
     // tell proxy to reuse connection, if we have one
     if ($.cookie('muxtoken')) {
       socket.emit('muxconnect',$.cookie('muxtoken'));
        MUXconnected=true;
     } else {
      $('#btn-connect').button('enable');
     }
   });
   
   socket.on("text",function(data) {
     textwindow.textView("appendLine",data);
   });

   socket.on("hud", function(data){
     if (HUD) {
       HUD.input(data);
     }
   });
   
   socket.on('mux-connected',function(token,fresh) {
   
     window.location.hash='connected';

     $.cookie('muxtoken',token);
     MUXconnected=true;
     
     if (HUD) {
       HUD.stop();
       HUD=null;
     }
     HUD=new HUDInfo(token.slice(0,4).replace(/[^A-Z0-9]/ig,'E'), hud_send);
     var sbi=speedbar.speedbar('instance');
     HUD.addListener('ownMechChanged',sbi.updateInfo.bind(sbi));

     var hbi=heatbar.heatbar('instance');
     HUD.addListener('ownMechChanged',hbi.updateInfo.bind(hbi));

     var mwi=map.mapview('instance');
     HUD.addListener('ownMechChanged',mwi.updateOwnMechInfo.bind(mwi));
     HUD.addListener('mapSlice',mwi.updateMapInfo.bind(mwi));
     HUD.addListener('contactsChanged',mwi.updateContacts.bind(mwi));
     HUD.addListener('weaponList',mwi.updateWeaponSpecs.bind(mwi));
     HUD.addListener('weaponsChanged',mwi.updateWeapons.bind(mwi)); // TODO: emit
     
     var wl=weapons.weaponlist('instance');
     HUD.addListener('weaponList',wl.updateWeaponSpecs.bind(wl));
     HUD.addListener('ownMechChanged',wl.updateMech.bind(wl));
     HUD.addListener('weaponsChanged',wl.updateWeapons.bind(wl)); // TODO: emit
     HUD.addListener('limbsChanged',wl.updateLimbs.bind(wl)); // TODO: emit
     
     
     $('#btn-connect').button('disable');
     $('#btn-disconnect').button('enable');
     
     var bb=$('#btn-battle');
     bb.button('enable');
     HUD.addListener('started',function() {
       if (!bb[0].checked) {
         bb.trigger('click');
       }
     });
     HUD.addListener('stopped',function() {
       if (bb[0].checked) {
         bb.trigger('click');
       }
     });
     
     
     var startupConfig=getConfig("startup");
     if (fresh) {
       textwindow.textView("appendLine", [ ['f12'],"Fresh connection!" ]); 
       if (startupConfig.onConnect) {
         setTimeout(function() {  socket.emit("send",startupConfig.onConnect); },500); 
       }
     } else {
       textwindow.textView("appendLine", [ ['f12'],"Open connection re-used!" ]); 
       if (startupConfig.onReconnect) {
         setTimeout(function() {  socket.emit("send",startupConfig.onReconnect); },500); 
       }
     }
   });

   socket.on('mux-disconnected',function(data) {

     window.location.hash='disconnected';

     $.removeCookie('muxtoken');
      MUXconnected=false;
     if (HUD) {
       HUD.stop();
       HUD=null;
     }
     $('#dialog-reconnect').dialog({
       modal: true,
       buttons: {
        Ok: function() {
         $( this ).dialog( "close" );
         socket.emit('muxconnect');
        },
        Cancel: function() {
         $( this ).dialog( "close" );
        }
       }    
     });
     $('#btn-connect').button('enable');
     $('#btn-disconnect').button('disable');
     $('#btn-battle').button('disable');
   });




/////////////// HUD Mode Switch
  function startHud() {

   window.location.hash='battle';

   if (HUD) {
     HUD.start();
     $('body').addClass('battle');
     $('#textwidget').textView("scrollDown",100);
   } else {
     $('#btn-battle')[0].checked=false;
     $('#btn-battle').button("refresh"); 
   }
  }
  
  function endHud() {
  
    window.location.hash='peace';

    if (HUD) {
       HUD.stop();
    }
    $('body').removeClass('battle');
  }

   $('#btn-battle').button().change(function() {
     if (this.checked) {
       startHud();
     } else {
       endHud();
     }
   });   

   
   $(window).bind('beforeunload', function(){
    if (MUXconnected) {
      return 'Connection still open\nReally close?';
    } else {
      return undefined;
    }
   });



///// Settings
   $('#btn-settings').button('enable');
   $('#btn-settings').click(function() {
      $(this).button('disable');
      $('#dialog-settings').dialog({
           minWidth: 555,
           buttons: {
             Ok: function() {
               setConfig('textwidget',$.extend({},getConfig('textwidget'),{
                 fontsize: $('#textwidget').textView('option','fontsize'),
                 scrollback: $('#textwidget').textView('option','scrollback')
               }));
               setConfig('mapwidget',$.extend({},getConfig('mapwidget'),{
                 style: $('#map').mapview('option','style') 
               }));
               setConfig('startup',$.extend({},getConfig('startup'), {
                 onConnect: $('#settings-connect-script').val()
               }));
             
                $( this ).dialog( "close" );
             }
           },
           close: function() {
              $('#btn-settings').button('enable');
           }
      });
      $('#settings-font-size').change(function() {
        $('#textwidget').textView('option','fontsize',$( this ).val());
        $('#font-size-display').text($( this ).val());
          
      });
      $('#settings-font-size').val($('#textwidget').textView('option','fontsize'));
      $('#font-size-display').text($('#textwidget').textView('option','fontsize'));

      $('#settings-scrollback').change(function() {
        $('#textwidget').textView('option','scrollback',$( this ).val());
        $('#scrollback-display').text($( this ).val());
          
      });
      $('#settings-scrollback').val($('#textwidget').textView('option','scrollback'));
      $('#scrollback-display').text($('#textwidget').textView('option','scrollback'));
       
      $('#settings-style').change(function() {
          $('#map').mapview('option','style',$( this ).val());
      });
      $('#settings-style').val($('#map').mapview('option','style'));
      $('#settings-connect-script').val(getConfig("startup").onConnect);

  });


   $('#btn-todo').button('enable');
   $('#btn-todo').click(function() {
      $(this).button('disable');
      $('#dialog-todo').dialog({
           minWidth: 777,
           close: function() {
              $('#btn-todo').button('enable');
           }
      });
   });


   $('#btn-help').button('enable');
   $('#btn-help').click(function() {
      $(this).button('disable');
      $('#dialog-help').dialog({
           minWidth: 777,
           close: function() {
              $('#btn-help').button('enable');
           }
      });
   });
      
    window.location.hash='startup finished';

    setInterval(function checkWebSocket() {
     // FEAR Polling mode 
     try {
       if (socket.io.engine.transport.name != 'websocket') { // TODO: This is not an official socket.io API. Might break on other versions.
         $('#ws-warning').text("Warning: connected in "+String(socket.io.engine.transport.name)+" Mode! Expect LAG.");
       } else {
         $('#ws-warning').text("");
       }
     }
     catch(e) { console.log(e); $('#ws-warning').text(String(e)); }
    },1234);

  },100);
  
  
  
});
