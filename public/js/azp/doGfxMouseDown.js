define([
  './getGfxMouse',
  './pointInDrawing',
  './getHoveredShape',
  './wb/whiteboard'
], function(getGfxMouse, pointInDrawing, getHoveredShape, whiteboard){

  'use strict';

  return function doGfxMouseDown(evt){
    var pt = getGfxMouse(evt);
    if(pointInDrawing(pt)){
      whiteboard.mouseDownPt = pt;
      whiteboard.points = [pt];
      whiteboard.mouseDown = true;

      whiteboard.selectedShape = getHoveredShape(whiteboard.drawing,pt);
    }
  };

});