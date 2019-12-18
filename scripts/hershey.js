function newObject(object) {
    return JSON.parse(JSON.stringify(object))
}

Hershey = function(fontName){
  scope = this;

  this.chars = [];
  this.data;
  this.fontName = fontName;

  this.initFont = function(){
      scope.chars = require('../hershey/data.json')

      let hyphen = newObject(scope.chars[13]);
      let aChapeau = newObject(scope.chars[65]);
      let eUp = newObject(scope.chars[69]);
      let eDown = newObject(scope.chars[69]);
      let eTrema = newObject(scope.chars[69]);
      let iTrema = newObject(scope.chars[73]);
      let iChapeau = newObject(scope.chars[73]);
      let gMaj= newObject(scope.chars[39]);
      let aGrave = newObject(scope.chars[65]);

      aGrave.paths.push([
        [-2,-6],
        [5,-3]
      ]);

      hyphen.paths = hyphen.paths.slice(1)
      hyphen.paths.push([
        [-4,4],
        [4,4]
      ]);

      aChapeau.paths.push([
          [-2, -3],
          [1, -5],
          [3, -3]
      ])
      eUp.paths.push([[-2, -3], [2, -4]])
      eDown.paths.push([[-2, -4], [2, -3]])
      iTrema.paths.push([
          [-3, -5],
          [-3, -4],
          [-2, -4],
          [-2, -5],
          [-3, -5]
      ])
      eTrema.paths.push([
          [-4, -5],
          [-4, -4],
          [-3, -4],
          [-3, -5],
          [-4, -5]
      ])
      eTrema.paths.push([
          [1, -5],
          [1, -4],
          [2, -4],
          [2, -5],
          [1, -5]
      ])
      iChapeau.paths = iChapeau.paths.slice(1)
      iChapeau.paths.push([
          [-2, -3],
          [1, -5],
          [3, -3]
      ])

      gMaj.paths = gMaj.paths.slice(1)
      gMaj.paths.push([[0.2295,-12.0437],[-2.0201,-11.5907],[-3.9769,-10.3899],[-5.3167,-8.5357],[-5.4933,-6.2721],[-4.3968,-4.2681],[-2.5040,-2.9637],[-0.2381,-2.7214],[2.0216,-3.1701],[4.1414,-4.0725],[6.0201,-5.4031],[7.4173,-7.2228],[7.8579,-9.4604],[7.0224,-11.5557],[4.8442,-11.9820],[2.7109,-11.1265],[0.8268,-9.7998],[-0.6979,-8.0819],[-1.7046,-6.0080],[-2.5980,-3.8805],[-3.1245,-1.6675],[-3.2668,0.6351],[-3.1161,2.9349],[-2.4422,5.1339],[-1.1364,7.0245],[0.7407,8.3485],[2.9353,9.0303],[5.2164,8.8582],[7.0578,7.5284],[7.5955,5.3350],[7.4624,3.0315],[7.6244,9.3853],[7.8655,11.6774],[8.0202,13.9797],[7.9429,16.2837],[7.2981,18.4858],[5.6756,20.0737],[3.4465,20.1180],[1.7880,18.5616],[1.0566,16.3933],[1.5108,14.1693],[3.0473,12.4730],[5.0439,11.3213],[7.0671,10.2144],[8.6940,8.7009],[10.6037,7.4478],[12.1389,5.7271]])

      scope.chars[194] = aChapeau
      scope.chars[200] = eDown
      scope.chars[201] = eUp
      scope.chars[203] = eTrema
      scope.chars[206] = iChapeau
      scope.chars[207] = iTrema
      scope.chars[13] = hyphen
      scope.chars[39] = gMaj
      scope.chars[192] = aGrave
  }

  this.parse_glyph = function(data, num_points){
    var segments = [];
    var points = [];
    var orig_data = data;

    var wh = data.slice(0,2);
    data = data.slice(2,data.length);
    var min_x = wh.charCodeAt(0) - 'R'.charCodeAt(0);
    var max_x = wh.charCodeAt(1) - 'R'.charCodeAt(0);

    while(data){
      var xy = data.slice(0,2);
      data = data.slice(2,data.length);
      if(xy == null || xy == '')
        continue;

      if(xy == ' R'){
        segments.push(points);
        points = [];
      } else {
        x = xy.charCodeAt(0) - 'R'.charCodeAt(0);
        y = xy.charCodeAt(1) - 'R'.charCodeAt(0);
        points.push([x,y]);
      }
    }
    segments.push(points);
    return {
      'paths': segments,
      'bounds': [min_x,max_x],
      'num_points': num_points,
      'data': orig_data
    };
  }

  this.parse_hershey_data = function(data){
    var glyphs = [];
    while(data){
      var id = data.slice(0,5);
      var num_points = data.slice(5,8);
      if(id == null || num_points == null)
        continue;

      id = 1*id;
      num_points = 1 * num_points;
      var to_read = 2 * num_points;
      if(num_points > 32)
        to_read += Math.ceil((num_points - 32) / 36);
      var points = data.slice(8, 8+to_read);
      var len = 9 + points.length;
      data = data.slice(len,data.length);
      points = points.replace(/[\n\r]/g,"");
      glyphs.push(scope.parse_glyph(points, num_points));
    }
    return glyphs;
  }

  this.glyphForChar = function(ascchr){
    console.log(ascchr.charCodeAt(0) - 32);
    return scope.chars[ascchr.charCodeAt(0) - 32];
  }

  this.pathForChar = function(ascchr){
    var glyph = scope.glyphForChar(ascchr);
    var pathstr = '';
    var sep = '';
    if(glyph !== undefined){
      $(glyph['paths']).each(function(j,seg){
       pathstr += sep + scope.pathForSegment(seg);
       sep = ' ';
     });
    }
    return pathstr;
  }

  this.pathForSegment = function(seg){
    var segstr = '';
    if(seg.length == 0)
      return segstr;
    var orig = seg[0];
    segstr += 'M ' + orig[0] + ' ' + orig[1];
    var tseg = seg.slice(1, seg.length);
    $(tseg).each(function(k, pt){
      segstr += ' L ' + pt[0] + ' ' + pt[1];
    });
    return segstr;
  }

  this.boundsForChar = function(ascchr){
    var glyph = scope.glyphForChar(ascchr);
    if(glyph === undefined)
      return {'left': 0, 'right': 0};

    var left = glyph.bounds[0];
    var right = glyph.bounds[1];
    return {'left': left, 'right': right};
  }

  this.heightForChar = function(ascchr){
    var min_y = 0;
    var max_y = 0;
    var glyph = scope.glyphForChar(ascchr);
    if(glyph === undefined)
      return 0;

    $(glyph['paths']).each(function(j,seg){
      if(seg.length != 0){
        $(seg).each(function(k, pt){
          var y = pt[1];
          if(y > max_y)
            max_y = y;
          else if(y < min_y)
            min_y = y;
        });
      }
    });

    return max_y - min_y;
  }

  this.pathValuesForText = function(text){
    var w = 0;
    var paths = [];
    for(var i = 0; i < text.length; i++){
      var ascchr = text.charAt(i);
      var path = { 'segments': scope.pathValuesForChar(ascchr) };
      var bounds = scope.boundsForChar(ascchr);
      w += Math.abs(bounds.left);
      if(w > 0){
        path['translate'] = [w,0]
      }
      if(path.segments != [])
        paths.push(path);
      w += bounds.right;
    }
    return paths;
  }

  this.pathValuesForChar = function(ascchr){
    var glyph = scope.glyphForChar(ascchr);
    var segments = [];
    if(glyph !== undefined){
      segments = $(glyph['paths'])
    }
    return segments;
  }

  /**
   * Array of Path hashes:
   * [ { 'transform': 'translate(x,y)', 'd': '...' } ]
   */
  this.pathsForText = function(text){
    var w = 0;
    var paths = [];
    for(var i = 0; i < text.length; i++){
      var ascchr = text.charAt(i);
      var path = { 'd': scope.pathForChar(ascchr) };
      var bounds = scope.boundsForChar(ascchr);
      w += Math.abs(bounds.left);
      if(w > 0){
        path['translate'] = [w,0];
      }
      if(path.d !== '')
        paths.push(path);
      w += bounds.right;
    }
    return paths;
  }

  /**
   * TODO: Ugh, clean this up!
   * { 'w': ..., 'h': ... }
   */
  this.boundsForText = function(text){
    var w = 0;
    var h = 0;
    for(var i = 0; i < text.length; i++){
      var ascchr = text[i];
      var bounds = scope.boundsForChar(ascchr);
      var height = scope.heightForChar(ascchr);
      w += Math.abs(bounds.left) + bounds.right;
      if(height > h)
        h = height;
    }
    return {'w': w, 'h': h};
  }
}
