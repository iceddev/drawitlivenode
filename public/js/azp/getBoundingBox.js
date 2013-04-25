define([

], function(){

  'use strict';

  return function getBoundingBox(geom){

   if(geom.xPts && geom.yPts){
     var xs = geom.xPts;
     var ys = geom.yPts;
     var bb = {x1: 0, x2: -1, y1: 0, y2: -1 };

     if(xs.length > 1){
      bb.x1 = xs[0];
      bb.x2 = xs[1];
      dojo.forEach(xs, function(x){
        if(x < bb.x1){
          bb.x1 = x;
        }
        else if(x > bb.x2){
          bb.x2 = x;
        }
      });
     }

     if(ys.length > 1){
        bb.y1 = ys[0];
        bb.y2 = ys[1];
        dojo.forEach(ys, function(y){
          if(y < bb.y1){
            bb.y1 = y;
          }
          else if(y > bb.y2){
            bb.y2 = y;
          }
        });
     }

     return bb;
    } else {
      return null;
    }
  };

});