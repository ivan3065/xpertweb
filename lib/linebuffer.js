// Little Messy Helper class to cut a byte-stream into single lines

// Ivan 2014

module.exports = (function() {

  function LineBuffer() {
    this.buffer='';
  }

  LineBuffer.prototype.input=function input(str) {
    this.buffer+=str;
//    console.log("buffer size = ",this.buffer.length);
  }

  LineBuffer.prototype.getLine=function getLine() {
    var end = this.buffer.indexOf("\n");
    if (end==-1)    
      return null;

    var cut=end;
    if (cut>0 && this.buffer[cut-1]==="\r") {
      cut--;
    }
    var line=this.buffer.slice(0,cut);
    this.buffer=this.buffer.slice(end+1);
//    console.log("Got line with len = ",line.length, " remaining buffer = ", this.buffer.length);
    return line;
  }

  return LineBuffer;
})();
  