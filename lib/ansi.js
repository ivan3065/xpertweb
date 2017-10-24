// Based on https://gist.github.com/Twisol/951035

// Modified for MUX usage by Ivan 

//var sys = require("sys");
 
var ANSI = (function() {
//  sys.inherits(ANSI, require("events").EventEmitter);
  
  function ANSI() {
    this.state = "plain";
    this.colorState={};
    this.colorFG='';
    this.colorBG='';
    this.reset();
  }
  
  ANSI.prototype.reset = function() {
    this.params = [];
    this.param = null; // null coerces to 0 when used in arithmetic
    this.intermediate = [];
  };
  
  ANSI.prototype.parse = function(str) {
    var ret=[];
    var end = str.length;
    var i = 0;
    
    var left = this.state === "plain" ? i : end;
    var right = end;
    
    var ch, nextESC;
    while (i < end) {
      ch = str[i];
      
      switch (this.state) {
        // Plain, normal text
        case "plain":
          nextESC = str.indexOf("\u001b", i);
          if (nextESC === -1) {
            i = end;
          } else {
            right = i = nextESC;
            this.state = "esc";
          }
          break;
        
        // An ESC has been detected - begin processing ANSI sequence
        case "esc":
          if (ch === "[") {
            this.state = "params";
          } else {
            this.state = "plain";
          }
          break;
        
        // Capture a parameter
        case "params":
          if ("0" <= ch && ch <= "9") {
            this.param = (this.param * 10) + (ch - 0);
            break;
          } else {
            this.params.push(this.param);
            this.param = null;
            
            this.state = "param-end";
            // NOTE: FALL-THROUGH
          }
        
        // Check if there are any more parameters
        // This label isn't strictly neccesary, but it's self-documenting.
        case "param-end":
          if (ch === ";") {
            this.state = "params";
            break;
          } else {
            this.state = "intermediate";
            // NOTE: FALL-THROUGH
          }
        
        // Capture intermediate databytes
        case "intermediate":
          if (" " <= ch && ch <= "/") {
            this.intermediate.push(ch);
            break;
          } else {
            this.state = "final";
            // NOTE: FALL-THROUGH
          }
        
        // Capture the command type
        // This label isn't strictly necessary, but it's self-documenting.
        case "final":
          if ("@" <= ch && ch <= "~") {
            if (left < right) {
              if (left==0) { // beginning of line: if we have leftover color from the previous line, re-send it here: TODO: unify with other plain-text-push-of-BoL-Colors
                var s=Object.keys(this.colorState);
                if (this.colorFG !== '') { s.push('f'+(this.colorFG+(this.colorState.b?8:0))); }
                if (this.colorBG !== '') { s.push('b'+(this.colorBG+(this.colorState.b?8:0))); }
                if (s.length) {
                  ret.push(s);
                }
              }
              ret.push(str.slice(left, right));
            }
            // Command. -> parse/read command codes here, map to color.css classes
            ret.push(this.updateColorState(ch, this.params, this.intermediate.join("")));
            left = i + 1;
          }
          
          this.state = "plain";
          this.reset();
          
          right = end;
          break;
      }
      
      i += 1;
    }
    
    if (left < right) {
      if (left==0) { // beginning of line: if we have leftover color from the previous line, re-send it here: TODO: unify with other plain-text-push-of-BoL-Colors
        var s=Object.keys(this.colorState);
        if (this.colorFG !== '') { s.push('f'+(this.colorFG+(this.colorState.b?8:0))); }
        if (this.colorBG !== '') { s.push('b'+(this.colorBG+(this.colorState.b?8:0))); }
        if (s.length) {
          ret.push(s);
        }
      }
      ret.push(str.slice(left, right));
    }
    return ret;
  };
  
  ANSI.prototype.resetColorState=function resetColorState() {
       this.colorState={};
       this.colorFG='';
       this.colorBG='';
  };
  ANSI.prototype.updateColorState=function updateState(ch,params,im) {
    if (ch != 'm') {
      console.log("unknown ch ["+ch+"]",params,im);
      return " ?"+ch+"? ";
    }
    if (params.length==0) { // reset
	this.resetColorState();
    }
    var that=this;
    params.forEach(function(command) {
          switch (command) {
          // Color sequences are used the most, so they come first
          case 30: case 31: case 32: case 33:
          case 34: case 35: case 36: case 37:
            that.colorFG = command - 30;
            break;
          
          case 40: case 41: case 42: case 43:
          case 44: case 45: case 46: case 47:
            that.colorBG = command - 40;
            break;
          
          case 0:  that.resetColorState(); break;
          case 1:  that.colorState.b = true;     break; // intense
          case 2:  that.colorState.faint = true;     break; // faint
          case 3:  that.colorState.i = true;     break; // italic
          case 4:  that.colorState.u = true;  break; // underline
          case 5:  that.colorState.blink = true;  break;
          case 7:  that.colorState.negative = true;   break;
          case 8:  that.colorState.concealed = true;  break;
          case 9:  that.colorState.strike = true;     break;
          case 20: that.colorState.frak = true;    break // fraktur
          case 21: that.colorState.uu = true;    break; // double underline
          case 22: delete that.colorState.b;    break;
          case 23: delete that.colorState.i;    break;
          case 24: delete that.colorState.u; break;
          case 25: delete that.colorState.blink; break;
          case 27: delete that.colorState.negative;  break;
          case 28: delete that.colorState.concealed; break;
          case 29: delete that.colorState.strike;    break;
          
          case 39:
            that.colorFG='';
            break;
          
          case 49:
            that.colorBG='';
            break;

	  default:
   	     that.colorState['unsupported-'+command]=true;
        }
    
    
    });

    var s=Object.keys(this.colorState);
    if (this.colorFG !== '') { s.push('f'+(this.colorFG+(this.colorState.b?8:0))); }
    if (this.colorBG !== '') { s.push('b'+(this.colorBG+(this.colorState.b?8:0))); }
    return s;
  };
  
  return ANSI;
})();
 
module.exports = ANSI;
