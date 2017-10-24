"use strict";
/*
Copyright (c) 2014,2017, Ernst Bachmann <ivan@netandweb.de>
All rights reserved. Please see file "LICENSE" for details.
*/

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    net = require('net'),
    conf = require('./config.json'),
    crypto = require('crypto'),
    async = require('async'),
    escape = require('escape-html'),
    ANSI=require('./lib/ansi.js'),
    LineBuffer=require('./lib/linebuffer.js');

// Stupid tester MUX replacement:
// sock -d -l 127.0.0.1:5555 'bzcat BattleLog-2005-03-27-225301.log.bz2 | grep -v HUD | cut -c 7- | while read x; do echo $x; sleep 1; done'


// Serve Static html/js/css
app.use(express.static(__dirname + '/htdocs'));
// index.html  - Directoryindex
app.get('/', function (req, res) {
  // DirectoryIndex.
  res.sendfile(__dirname + '/htdocs/index.html');
});

var muxes={};

// Websocket to Browser is "socket",
// TCP/Telnet socket to MUX is "mux"
io.sockets.on('connection', function (socket) {
  console.log("WEB-connected ",socket.id);

  var mux;

  // parser has state, so should be a member in mux, and only called once.
  // that would require "muxdata" to be connected only once, and have a new muxparseddata emit on ansi/mux
  var ansi=new ANSI();
  var linebuffer=new LineBuffer();

  function muxdata(data) {
    var str=data.toString(conf.muxcharset);
    // split in lines
    linebuffer.input(str);
    
    var line;
    // foreach line
    async.whilst(
      function() {
        line=linebuffer.getLine();
        return line != null;
      },
      function(next) {
        if (line.match(/^#HUD/)) {
          socket.emit("hud",line);
        } else {
          var arry=ansi.parse(line); 
          // clean html...
          var clean=arry.map(function(e) {
            if (typeof e=='string') 
              return escape(e);
            return e;
          });
       
          socket.emit("text",clean);
        }
        setImmediate(next);
      },
      function(err) {
        // while done
        if (err) console.log("whilst: ",err);  
      }
    );
  }

  function muxend() {
    if (mux) {
       console.log("mux disconnected ",mux.token, arguments);
       socket.emit("text",[['fg2','i'],"← Connection lost"]);
       socket.emit("mux-disconnected",mux.token);
       delete muxes[mux.token]
       mux.destroy();
       mux=null;
    }
  }

    function muxerror(err) {
       console.log("MUXError:",err);
       // maybe throttle global reconnects?
       if (mux) {
          socket.emit("text",[['fg2','i','b'],"⌿ Connection failed"]);
       }
       // should be followed directly by muxend-callback
    }

  function muxconnect(token) { 
    if (mux) {
      console.log("Double MUX Connection attempt!");
      return;
    }
    var fresh=false;
    async.waterfall([
    function(next) {
      if (token && muxes[token]) {
        mux=muxes[token];
        if (mux.active) {
          console.log("Attempt to re-use an already active mux-connection");
          // allow? Multi-Windowing?
        }
        mux.resume();

      }
      next();
    },
    function(next) {
     if (mux) return next();
     token=crypto.pseudoRandomBytes(15).toString('base64'); // Default NodeJS/OpenSSL config: pseudoRandom and Random use the same engine, just pseudoRandom is allowed to continue if entropy pool is empty.
     console.log("TOKEN", token);
     mux=net.connect({host: conf.muxserver, port: conf.muxport}, next);
     mux.active=0;
     fresh=true;
    },
    function(next) {
     socket.emit("text",[['fg9','i'],"→ Connection established"]);
     muxes[token]=mux;
     mux.token=token;
     mux.active++;
     mux.setKeepAlive(true,60000);
     mux.on("data", muxdata);
     mux.on("end", muxend);
     mux.on("error", muxerror);
     process.nextTick(next); // no real need for setImmediate. I/O starvation won't be an issue here.
    },
    function(next) {
     socket.emit("mux-connected",token,fresh);
     next();
    }
    ], function(err) {
      if (err) {
        console.log(err);
        delete muxes[token];
        if (mux) mux.destroy();
      }
    });
  }

  socket.on("muxconnect", muxconnect);
  socket.on("muxdisconnect", function() {
    if (mux) {
      mux.removeListener("data",muxdata);
      // removes the listener in this window. If another tab was connected to that mux, it'll get the muxend callback
      mux.removeListener("end",muxend);
      mux.removeListener("error",muxerror);
      console.log("mux.end called");
      delete muxes[mux.token];
      mux.end("\nquit\n");
    }
  });

  // Incoming!
  socket.on("send", function(data) {
//    console.log("send ",data);
    if (mux) mux.write(data+"\n"); // config param?
  });
  socket.on('disconnect', function() {
    console.log("WEB-disconnected ",socket.id);
    if (mux) {
      mux.active--;
      if (!mux.active) mux.pause();
      mux.lastUse=new Date();
      mux.removeListener("data",muxdata);
      mux.removeListener("end",muxend);
      mux.removeListener("error",muxerror);
      mux=null;
    }
    // keep mux in storage,  add timeout!
    //    mux.end();
  });


  // all done setting up
});


// Open Port
server.listen(conf.port,conf.bind);

console.log('Server running on port ' + conf.port);
setInterval(function() { 
  var now = new Date()
//  console.log("MUXES: ")
  Object.keys(muxes).forEach(function(key) {
//    console.log(" ",key,muxes[key].active); 
    if (!muxes[key].active) { // or use socket.setTimeout ? 
      console.log("   Age: ",(now-muxes[key].lastUse)," ms");
      if ((now-muxes[key].lastUse)>15*60*1000) {
        console.log("    --> Disconnect!");
        muxes[key].end();
        muxes[key].destroy();
        delete muxes[key];
        // TODO: Profile/Debug if this still leaks handles
      }
    }
  });
} ,10000);


process.on('uncaughtException', function (err) {
    console.log('uncaughtException',err);
}); 