define([
  './getShapeFromGeom'
], function(getShapeFromGeom){

  'use strict';

  return function moveShapeUp(geom, drawing){
    var shape = getShapeFromGeom(geom,drawing);
    if(shape){
      shape.moveToFront();
    }
  };

});