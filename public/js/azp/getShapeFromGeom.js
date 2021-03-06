define([
  'lodash'
], function(_){

  'use strict';

  return function getShapeFromGeom(geom, drawing){
    var retVal = null;
    _.all(drawing.children, function(shape){
      if((shape.cRand == geom.cRand) && (shape.cTime == geom.cTime)){
        retVal = shape;
        return false;
      }
      return true; // keep going until we find one that isn't
    });

    return retVal;
  };

});