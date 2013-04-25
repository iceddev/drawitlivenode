define([
  './getShapeFromGeom'
], function(getShapeFromGeom){

  'use strict';

  return function moveShape(geom, drawing){
    var shape = getShapeFromGeom(geom,drawing);
    if(shape){
      shape.applyTransform({dx: geom.xPts[0], dy: geom.yPts[0]});
      if(shape.wbbb){
        shape.wbbb.x1 += geom.xPts[0];
        shape.wbbb.x2 += geom.xPts[0];
        shape.wbbb.y1 += geom.yPts[0];
        shape.wbbb.y2 += geom.yPts[0];
      }
    }
  };

});