define([
  './getShapeFromGeom'
], function(getShapeFromGeom){

  'use strict';

  return function removeShape(geom, drawing){
    var shape = getShapeFromGeom(geom,drawing);
    if(shape){
      drawing.remove(shape);
    }
  };

});