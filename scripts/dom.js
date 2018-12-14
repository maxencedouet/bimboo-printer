var my_font;
var svg;
var exportable;
var disp_scale = 2.10;

const svg2gcode = require('./svg2gcode.js')


function engrave () {
    console.log('engrave')
}



function displayText(grp,text,x,y){
  var paths = my_font.pathsForText(text);
  var tg = svg.group(grp, {'transform': 'translate(' + x + ',' + y + ')'});
  $(paths).each(function(i,path){
    //var yoff = Math.floor((i/25)+1)*40;
    if(path.d != []){
      var opts = {};
      if(path.translate !== undefined)
        opts['transform'] = 'translate(' + path.translate[0] + ',' + path.translate[1] + ')';
      svg.path(tg, path.d, opts);
    }
  });
}

function displayTextboxContent(){
  var max_w = 1000; // (75mm / 0.28222mm/px), Inkscape's mm-per-px magic number.
  var max_h = 266;
  var max_w = max_w - 10; // gutters
  var max_h = max_h - 10; // gutters
  var scale = 1.0;
  var line_height = 35;
  var lines = $('#textula')[0].value.split('\n');
  // First, split long lines.
  var wrapped_lines = wrapLines(lines, max_w, max_h, scale);
  svg.clear();
  var grp = svg.group({'transform': 'translate(5,17) scale(' + disp_scale + ')'});
  var opts = {
        'stroke':'black',
        'fill': 'none',
        'strokeLinecap': 'round',
        'strokeLinejoin': 'round',
  };
  exportable = svg.group(grp, opts);
  var scribgrp = svg.group(exportable);
  grp = svg.group(exportable, {'transform': 'scale(' + wrapped_lines.scale + ')'});
  for(var i = 0; i < wrapped_lines.lines.length; i++){
    displayText(grp,wrapped_lines.lines[i], 5, (line_height / 2) + (line_height * i));
  }
  if((scribblePaths != undefined) && (scribblePaths != [])){
    $(scribblePaths).each(function(i,path){
      svg.path(scribgrp, path);
    });
  }
  var str = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="'
            + max_w + '" height="' + max_h + '">';
  str += svg.toSVG(exportable);
  str += '</svg>';
  $('#svg_out')[0].value = str;
  svg2gcode(str);
}

function wrapLines(lines, max_w, max_h, scale){
  // TODO: split on last char if unbroken by whitespace.
  var wrapped_lines = [];
  var done = false;
  var line_height = 35;
  while(!done){
    var scaled_h = max_h / scale;
    var scaled_w = max_w / scale;
    for(var i = 0; i < lines.length; i++){
      var line = lines[i];
      var newline = "";
      var line_w = 0;
      var sep = "";
      var words = line.split(' '); // TODO: on any whitespace
      for(var j = 0; j < words.length; j++){
        var word = words[j];
        var w = my_font.boundsForText(word).w;
        var sep_w = my_font.boundsForText(sep).w;
        var new_w = line_w + sep_w + w;
        if(new_w < scaled_w){
          newline += sep + word;
          line_w += sep_w + w;
          sep = " ";
        } else {
          wrapped_lines.push(newline);
          newline = word;
          line_w = w;
        }
      }
      if(newline != "")
        wrapped_lines.push(newline);
    }
    if(wrapped_lines.length * line_height > scaled_h){
      scale *= 100;
      wrapped_lines = [];
    } else {
      done = true;
    }
  }
  return {'lines':wrapped_lines, 'scale':scale};
}

function changeFont(){
  var fontName = $('#fontselector option:selected')[0].value;
  var newfont = new Hershey(fontName);
  newfont.initFont();
  setTimeout(function(){ my_font = newfont; displayTextboxContent(); }, 250);
}

function drawScribbles(){
  scribblePaths = [];
  var grp = svg.group();
  var segstr = "";
  var sep = "";
  var tscribs = scribbles.slice(0);
  if(thisScribble != []){
    tscribs.push(thisScribble);
  }
  $(tscribs).each(function(i,scribble){
   if(scribble !== undefined){
      var orig = scribble[0];
      segstr += sep + "M " + orig[0] + " " + orig[1];
      var tscrib = scribble.slice(1,scribble.length);
      $(tscrib).each(function(j,pt){
        segstr += " L " + pt[0] + " " + pt[1];
      });
      sep = " ";
    }
  });
  scribblePaths.push(segstr);
}

var mouseDown = false;
var scribbles = [];
var thisScribble = [];
var scribblePaths = null;

$(document).ready(
  function() {
    my_font = new Hershey('scripts');
    my_font.initFont();
    $('#hershey_text').svg({onLoad: function(tsvg){ svg = tsvg; displayTextboxContent()}});
    $("#textula").keyup(displayTextboxContent);
    $("#fontselector").change(changeFont);
    displayTextboxContent();
    // $('#hershey_text').mousedown(function(evt){
    //   mouseDown = true;
    //   last_mouse = null
    //   thisScribble = [];
    // });
    // $('#hershey_text').mouseup(function(evt){
    //   if(mouseDown && thisScribble != []){
    //     scribbles.push(thisScribble);
    //     drawScribbles();
    //     displayTextboxContent();
    //   }
    //   mouseDown = false;
    //   lastMouse = null;
    // });
    // $('#hershey_text').mousemove(function(evt){
    //   var el = $('#hershey_text');
    //   if(mouseDown){
    //     var rads = (3 / 180) * Math.PI;
    //     var sin = Math.sin(rads);
    //     var cos = Math.cos(rads);
    //     var offX = (evt.offsetX - el.offset().left) / disp_scale;
    //     var offY = (evt.offsetY - el.offset().top) / disp_scale;
    //     var tmpx = offX;
    //     offX = offX * cos - offY * sin;
    //     offY = offY * cos - tmpx * sin;
    //     thisScribble.push([offX,offY]);
    //     drawScribbles();
    //     displayTextboxContent();
    //   }
    // });
  }
);
