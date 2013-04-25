define([
  './getShapeFromGeom'
], function(getShapeFromGeom){

  'use strict';

  return function moveShapeDown(geom, drawing){
    var shape = getShapeFromGeom(geom,drawing);
    if(shape){
      shape.moveToBack();
    }
  };

});