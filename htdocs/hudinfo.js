'use strict';
/* 
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/


var HUDInfo=(function( $ ) {

  // Helper Const
  var NormHexWidth = 3.0*Math.tan(Math.PI/6.0)/2.0;

///////////////////////////////////////////////////////////////////////
// Mech Object  

  function HEXPos(x,y,z,angle,dist) {
    this.x=Math.round(x);
    this.y=Math.round(y);
    if (isFinite(z)) {
      this.z=Math.round(z);
    } else {
      this.z=0;
    }
    if (isFinite(angle) && isFinite(dist)) {
      this.angle=angle;
      this.dist=dist;
    } else {
      this.angle=0.0;
      this.dist=0.0;
    }
  }

  $.extend(HEXPos.prototype, {
    // Odd x hexes are higher/"norther"
    odd: function odd() {
      return 1==(this.x % 2);
    },
    // get carthesian pos inside hex based on subpos relative to center
    // with 1.0 == distance between two hex centers
    subXY: function subXY() {
      return [this.dist*Math.cos(this.angle - Math.PI/2.0),
              this.dist*Math.sin(this.angle - Math.PI/2.0)];
    },
 
    // get global carthesian pos in MUX Coordinates (1.0==hexdist, without dist: of hexcenter)
    mapXY: function mapXY() {
      return [
              this.x * NormHexWidth  -
              this.dist*Math.cos(this.angle - Math.PI/2.0),

              this.y + ((this.x+1)%2)*0.5 -
              this.dist*Math.sin(this.angle - Math.PI/2.0)
        ];
    },
    
    compare: function comparePosition(other) {
      return this.constructor.prototype.isPrototypeOf(other) && // TODO: replace check with simple !!other if its to slow
             this.x==other.x &&   
             this.y==other.y &&
             this.z==other.z &&
             Math.abs(this.angle - other.angle)< 0.001 &&
             Math.abs(this.dist - other.dist)<0.01;
    }
  
  
  });

///////////////////////////////////////////////////////////////////////
// Mech Object  
  function Mech(id) {
   this.id=id;
   this.flags="";
  }
  
  function getRealHeight(tile) {
    var t=tile.substr(0,1);
    var h=parseInt(tile.substr(1,1));
    if (!isFinite(h)) h=0;
    if (t=='~') h=0-h; // Water: Below
    if (t=='-') h=0; // Ice is 0 util it breaks.
    // TODO: Bridge stuff?
    return h;
  }
  
  $.extend(Mech.prototype,{
    isCliff: function cliffCheck(tileA,tileB) {
      var hA=getRealHeight(tileA);
      var hB=getRealHeight(tileB);
      
      switch (this.type) {
      case 'Q': // Quad
      case 'B': // Biped
         if (this.flags.match(/J/) && this.position) { // Jumping
           return ((hA > this.position.z) ^ (hB > this.position.z)); // XOR: don't paint large HighZ-Areas red.
         }
         return Math.abs(hA-hB)>2;      
      break;
      case 'H': // Hover
        var tA=tileA.substr(0,1);
        var tB=tileB.substr(0,1);
        if (tA=='~') hA=0; // Hover is on Water
        if (tB=='~') hB=0;
        if (Math.abs(hA-hB)>1) return true;
        if (tA==tB) return false; // Don't paint Forests in red.
        if (tA=='"' || tA=='`' || tA == '&' || tB=='"' || tB=='`' || tB == '&') return true; // No Woods or Fire.
        return false;
      default: return false;
      }
    },
    
    hasTurret: function() {
     if (this.type=='B' || this.type=='Q' || this.type=='I' || this.type=='S') return false; // Biped,Quad,Infantry,Battlesuit. TODO: check if vtols&co report a turret
      return this.turret !== null; // this also shows rottorso offset. Do not want! So:Check type character?
    }
  });



///////////////////////////////////////////////////////////////////////
// Parser / HUD Object

  function pF(num) {
    num=parseFloat(num);
    if (typeof num=='number' && isFinite(num)) return num;
    return null;
  }
  function pA(num) {
    num=parseFloat(num);
    if (typeof num=='number' && isFinite(num)) return num*Math.PI/180.0;
    return null;
  }
  function pI(num) {
    num=parseInt(num);
    if (typeof num=='number' && isFinite(num)) return num;
    return null;
  }

  function HUD(key,outpipe) {
    this.key=key;
    this.output=outpipe;
    this.mechs={};
// Debug
window.HUD=this;
  // Listeners
    this._listeners={};
  };

  $.extend(HUD.prototype,{
    // listeners:
    addListener: function(event, fn) {
      if (!this._listeners[event]) {
        this._listeners[event]=[];
      }
      this._listeners[event].push(fn);
    },
    callListeners: function callListeners(event,data) {
       if (!this._listeners[event]) { return; }
       this._listeners[event].forEach(function emitEvent(fn) {
         fn.call(this,data,this);
       });
    },
  
  
    // Nested classes:
    Mech: Mech,
    getMech: function getMech(id) {
      var id=id.toLowerCase();
      var m=this.mechs[id];
      return m;
    },
    storeMech: function storeMech(mech) {
      var id=mech.id.toLowerCase();
      this.mechs[id]=mech;
    },
    mechChanged: function mechChanged(mech) {
      if (mech.id.toLowerCase()===this.ownMechID) {
        this.callListeners('ownMechChanged',mech);
      }
      this.callListeners('mechChanged',mech); // used? single-mech-update?
    },
    
    HEXPos: HEXPos,


    // Parser interface    
    input: function HUDInput(line) {
      if (line.slice(0,4)=='#HUD'   && line[4]==':' && 
          line.slice(5,9)==this.key && line[9]==':') {
          var col=line.indexOf(':',10);
          if (col>10) {
            var cmd=line.slice(10,col);
            if(this['_hudinfo_'+cmd]) {
              this['_hudinfo_'+cmd].call(this,line.slice(col+1));
            } else {
              console.log("Unimplemented HUDINFO Command ("+cmd+") in |"+line);
            }
          } else {
            console.log("Mangled hudinfo |"+line);
          }
      } else
      console.log(line);
    },
    _hudinfo_KEY: function(data) {
      console.log("Server accepted our KEY");
    },

    /**
       hudinfo gs

       response:
       Exactly once:
            #HUD:<key>:GS:R# ID,X,Y,Z,CH,DH,CS,DS,CH,HD,CF,CV,DV,RC,BC,TU,FL

0      ID: mechid, own mech ID
1-3    X, Y, Z : coordinates, current location
4      CH: degree, current heading
5      DH: degree, desired heading
6      CS: speed, current speed,
7      DS: speed, desired speed
8      CH: heatmeasure, current heat
9      HD: heatmeasure, current heat dissipation
10     CF: fuel or '-', current fuel or '-' if not applicable)
11     CV: speed, current vertical speed
12     DV: speed, desired vertical speed
13     RC: range, range to center of current hex
14     BC: degree, bearing of center of current hex
15     TU: offset or '-', torso/turret facing offset (or '-' if not applicable)
16     FL: Unit status flags
    */
    _hudinfo_GS: function(data) {
      if (data.slice(0,3)=='E# ') {
        console.log(data);
        if (data=='E# Not in a BattleTech unit') this.stop();
        return;
      }
      if (data.slice(0,3)!='R# ') return;
      
      
      var p=data.slice(3).split(',');

      this.ownMechID=p[0].toLowerCase();     
      var me=this.getMech(p[0]);
      if (!me) {
        me=new this.Mech(this.ownMechID);
        this.storeMech(me);
        setTimeout(this.output.bind(this,"hudinfo sgi"), 100);
      }
      me.los=true;
      me.position=new this.HEXPos(pI(p[1]),pI(p[2]),pI(p[3]),pA(p[14]),pF(p[13]));
      me.heading=pA(p[4]);
      me.desiredHeading=pA(p[5]);
      me.speed=pF(p[6]);
      me.desiredSpeed=pF(p[7]);
      me.heat=pI(p[8]);
      me.heatDissipation=pI(p[9]);
      me.fuel=pI(p[10]);
      me.vspeed=pF(p[11]);
      me.desiredVSpeed=pF(p[12]);
      me.turret=pA(p[15]);
      me.flags=p[16];
      
      var jX=pI(p[17]);
      var jY=pI(p[18]);
      if (jX !== null && jY !== null) {
        me.jumpTarget=new this.HEXPos(jX,jY);
      } else {
        me.jumpTarget=null;
      }
      
      this._gs_stamp=new Date();
      // now emit update call for changed mech data
      this.mechChanged(me);
    },
 
   /**
command:
	hudinfo sgi

   response:
   Exactly once:
	#HUD:<key>:SGI:R# TC,RF,NM,WS,RS,BS,VS,TF,HS,AT

   TC: unit type character
   RF: string, unit referece
   NM: string, unit name
   WS: speed, unit max walking/cruise speed
   RS: speed, unit max running/flank speed
   BS: speed, unit max reverse speed
   VS: speed, unit max vertical speed
   TF: fuel, or '-' for n/a
   HS: integer, number of templated (single) heatsinks
   AT: advtech, advanced technology available or '-' if n/a
    */ 
  
   _hudinfo_SGI: function(data) {
      if (data.slice(0,3)=='E# ') {
        console.log(data);
        if (data=='E# Not in a BattleTech unit') this.stop();
        return;
      }
      if (data.slice(0,3)!='R# ') return;
      if (!this.ownMechID) {
        // can't parse yet, fetch gs first
        setTimeout(this.output.bind(this,"hudinfo gs"), 100);
        return;
      }
      var p=data.slice(3).split(',');

      var me=this.getMech(this.ownMechID);
      if (!me) {
        me=new this.Mech(this.ownMechID);
        this.storeMech(me);
      }
      me.type=p[0];
      me.ref=p[1];
      me.name=p[2];
      var walk=pF(p[3]);
      var run=pF(p[4]);
      if (walk<run) {
        me.walkSpeed=walk;
        me.runSpeed=run;
      } else {
         me.walkSpeed=run;
         me.runSpeed=walk;
      }
      me.backSpeed=pF(p[5]);
      me.maxVSpeed=pF(p[6]);
      me.maxFuel=pF(p[7]);
      me.heatsinks=pI(p[8]);
      me.advTech=p[9];
      

      this._sgi_stamp=new Date();
      // now emit update call for changed mech data
      this.mechChanged(me);
   },


/*
   command:
        hudinfo c

   response:
   Zero or more:
        #HUD:<key>:C:L# ID,AC,SE,UT,MN,X,Y,Z,RN,BR,SP,VS,HD,JH,RTC,BTC,TN,HT,FL
   Exactly once:
        #HUD:<key>:C:D# Done

 0  ID: mechid, ID of the unit
 1  AC: arc, weapon arc the unit is in
 2  SE: sensors, sensors that see the unit
 3  UT: unit type character
 4  MN: string, mechname of unit, or '-' if unknown
5-7   X, Y, Z: coordinates of unit
 8  RN: range, range to unit
 9  BR: degree, bearing to unit
 10  SP: speed, speed of unit   
 11  VS: speed, vertical speed of unit
 12  HD: degree, heading of unit
 13  JH: degree, jump heading, or '-' if not jumping
 14  RTC: range, range from unit to X,Y center
 15  BTC: degree, bearing from unit to X,Y center
 16  TN: integer, unit weight in tons
 17  HT: heatmeasure, unit's apparent heat (overheat)
 18  FL: unit status string



*/
    _hudinfo_C:  function(data) {

        var now=new Date();
       if (!this._in_C_list) { // first entry (not inside "L#" to handle empty contact list
          this._in_C_list=true;
          Object.keys(this.mechs).forEach((function(k) {
            if (k!=this.ownMechID) this.mechs[k].los=false;
          }).bind(this));
        }

       if (data.slice(0,3)=='E# ') {
         console.log(data);
         if (data=='E# Not in a BattleTech unit') this.stop();
         return;
      } else if (data.slice(0,3)=='L# ') {
      
         var p=data.slice(3).split(',');

         var me=this.getMech(p[0]);
	 if (!me) {
           me=new this.Mech(p[0]);
	   this.storeMech(me);
	 }
	 me.id=p[0]; // for changes of Enemy-Status...
         me.los=true;
         me.lastLOS=now;
	 me.type=p[3];
         me.name=p[4];
         me.position=new this.HEXPos(pI(p[5]),pI(p[6]),pI(p[7]),pA(p[15]),pF(p[14]));
         me.speed=pF(p[10]);
         me.vspeed=pF(p[11]);
         me.heading=pA(p[12]);
//          me.jumpTarget/direction ...
	 me.weight=pI(p[16]);
         me.heat=pI(p[17]);
         me.flags=p[18];
	 this.mechChanged(me);

      } else if (data.slice(0,3)=='D# ') {
        this._in_C_list=false;
        // Done. OK. Set mechs as out-of-LOS here?
        var list=[];
        Object.keys(this.mechs).forEach((function(k) {
          var me=this.mechs[k];
          if (k!=this.ownMechID && (
           me.los
           ||
           now - me.lastLOS < 3*60*1000
          )) list.push(me);
        }).bind(this));
        this.callListeners("contactsChanged",list);
      } else {
         console.log("todo: "+data);
      }
    
       this._c_stamp=new Date();
       
    },


/*
   command:
	hudinfo t [ <height> [ <range> <bearing> [ l ] ] ]

   response:
   Exactly once:
	#HUD:<key>:T:S# SX,SY,EX,EY,MI,MN,MV
   Once or more:
	#HUD:<key>:T:L# Y,TS
   Exactly once:
	#HUD:<key>:T:D# Done

   SX: coordinate, Start X
   SY: coordinate, Start Y
   EX: coordinate, End X
   EY: coordinate, End Y
   MI: map identifier
   MN: map name
   MV: map version number
Width 
height
*/

    _hudinfo_T: function(data) {
      if (data.slice(0,3)=='E# ') {
        console.log(data);
        if (data=='E# Not in a BattleTech unit') this.stop();
        return;
      } else if (data.slice(0,3)=='S# ') {

        var p=data.slice(3).split(',');
        this.mapslice={
	  startX:pI(p[0]),
	  startY:pI(p[1]),
	  endX:pI(p[2]),
          endY:pI(p[3]),
          id:pI(p[4]),
	  name:p[5], // '-1' ...
          version:p[6],
	  width:pI(p[7]),
	  height:pI(p[8]),
  	  slice:[]
        };

      
      } else if (data.slice(0,3)=='L# ') {

        var p=data.indexOf(',');
        var y=pI(data.slice(3,p)) - this.mapslice.startY;
        this.mapslice.slice[y]=data.slice(p+1);

      } else if (data.slice(0,3)=='D# ') {

        var ms=this.mapslice;
        this.mapslice=null;
	this.callListeners("mapSlice",ms); 
      
      } else {
        console.log("todo: "+data);
      }

      this._t_stamp=new Date();
    
    },

 /*

c. Weapon List

   command:
        hudinfo wl

   repsonse:
   Zero or more:
        #HUD:<key>:WL:L# WN,NM,NR,SR,MR,LR,NS,SS,MS,LS,CR,WT,DM,RT,FM,AT,DT
   Exactly one:
        #HUD:<key>:WL:D# Done

0   WN: integer, weapon number
1   NM: string, weapon name   
2   NR: range, minimum range  
3   SR: range, short range    
4   MR: range, medium range   
5   LR: range, long range     
6   NS: range, minimum range in water
7   SS: range, short range in water  
8   MS: range, medium range in water 
9   LS: range, long range in water   
10   CR: integer, size in critslots   
11   WT: integer, weight in 1/100 tons
12   DM: integer, maximum damage
   RT: integer, recycle time in ticks
   FM: weapon fire mode, possible fire modes
   AT: ammo type, possible ammo types
   DT: damage type
   HT: heat measure, weapon heat per salvo

*/

    _hudinfo_WL: function(data) {
      if (data.slice(0,3)=='E# ') {
        console.log(data); // should work everywhere, even in dested-not-battlemechs
        return;
      
      } else if (data.slice(0,3)=='L# ') {
       if (!this.__weaponList) { this.__weaponList=[]; }

	 var p=data.slice(3).split(',');
	this.__weaponList[pI(p[0])]={
	  name: p[1],
          ranges: [pI(p[2]),pI(p[3]),pI(p[4]),pI(p[5])],
          waterranges: [pI(p[6]),pI(p[7]),pI(p[8]),pI(p[9])],
	  critslots: pI(p[10]),
          weight: pI(p[11])/100.0,
          damage: pI(p[12]),
	  cycle: pI(p[13]),
          firemodes: p[14],
          ammotypes: p[15],
          damagetype: p[16],
          heat: pI(p[17])
	};


      } else if (data.slice(0,3)=='D# ') {

        var wl=this.__weaponList;
        this.__weaponList=null;
	this.callListeners("weaponList",wl); 
      
      } else {
        console.log("todo: "+data);
      }

      this._t_stamp=new Date();
    
    },

/*
   command:
        hudinfo we

   response:
   Zero or more:
        #HUD:<key>:WE:L# WN,WT,WQ,LC,ST,FM,AT
   Exactly once:
        #HUD:<key>:WE:D# Done

   WN: integer, weapon number
   WT: weapon type number
   WQ: weapon quality
   LC: section, location of weapon
   ST: weapon status
   FM: weapon fire mode
   AT: ammo type, the type of ammo selected
*/

    _hudinfo_WE:  function(data) {

       if (!this._in_WE_list) { // first entry (not inside "L#" to handle empty contact list
          this._in_WE_list=[];
        }

       if (data.slice(0,3)=='E# ') {
         console.log(data);
         if (data=='E# Not in a BattleTech unit') this.stop();
         return;
      } else if (data.slice(0,3)=='L# ') {
      
         var p=data.slice(3).split(',');
	this._in_WE_list.push({
	  num:pI(p[0]),
	  type:pI(p[1]),
	  quality:p[2],
	  section:p[3],
	  status:p[4],
	  firemode:p[5],
	  ammotype:p[6]
	});

      } else if (data.slice(0,3)=='D# ') {
        var list=this._in_WE_list;
        this._in_WE_list=false;
        this.callListeners("weaponsChanged",list);
      } else {
         console.log("todo: "+data);
      }
    
       this._we_stamp=new Date();
       
    },

/*

   command:
        hudinfo li

   response:
   Zero or more:
        #HUD:<key>:LI:L# SC,ST
   Exactly once:
        #HUD:<key>:LI:D# Done

   SC: section, only applicable sections are Arms/Legs and Suit1.
   ST: weapon status, status for this section.

*/

    _hudinfo_LI:  function(data) {

       if (!this._in_LI_list) { // first entry (not inside "L#" to handle empty contact list
          this._in_LI_list=[];
        }

       if (data.slice(0,3)=='E# ') {
         console.log(data);
         if (data=='E# Not in a BattleTech unit') this.stop();
         return;
      } else if (data.slice(0,3)=='L# ') {
      
         var p=data.slice(3).split(',');
	this._in_LI_list.push({
	  section:p[0],
	  status:p[1]
	});

      } else if (data.slice(0,3)=='D# ') {
        var list=this._in_LI_list;
        this._in_LI_list=false;
        this.callListeners("limbsChanged",list);
      } else {
         console.log("todo: "+data);
      }
    
       this._li_stamp=new Date();
       
    },

  
   _sgi_ival: 35107,
   _gs_ival : 857,
   _c_ival : 1121,
   _t_ival : 57011,
   _wl_ival: 3600000, // almost never automatically. Its quite the long list
   _we_ival: 1271,
   _li_ival: 1382,
   
  
    _queue: function queue_commands() {
      var now=new Date();
      // order is important. on start fetch map+map-dimensions first, then our mech that the map will be centered on. 
      var cmds=['t','gs','sgi','c','we','li','wl'];
      var params={t:'40'};
      for (var i=0; i< cmds.length; ++i) {
        var cmd=cmds[i];
        if (!this['_'+cmd+'_stamp'] || now - this['_'+cmd+'_stamp'] >  this['_'+cmd+'_ival']) {
          this.output("hudinfo "+cmd+ (params[cmd]?(' '+params[cmd]):''));
          // Prevent re-send before answer is here:
          this['_'+cmd+'_stamp']=now;
          return; // and only run one at a time
        }
      }
    
    },
  
    stop: function() {
      clearInterval(this._ival);
      console.log("Stopping hudinfo");
      this.callListeners("stopped");
    },
    start: function() {
      console.log("Starting hudinfo");
      
      this._ival=setInterval(this._queue.bind(this),47);
      this.callListeners("started");
      
      // Re-Setting the key is not strictly neccessary, but does not hurt...
      setTimeout(this.output.bind(this,"hudinfo key="+this.key), 10/* Run before first ival. more or less immediate */);
    }
  
  });



  return HUD;
})(jQuery);
