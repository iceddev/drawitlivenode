define([
  './drawFromJson',
  './createOffsetBB',
  './getGfxMouse',
  './pointInDrawing',
  './getHoveredShape',
  './wb/whiteboard',
  './wb/create-json'
], function(drawFromJSON, createOffsetBB, getGfxMouse, pointInDrawing, getHoveredShape, whiteboard, createGeom){

  'use strict';

  return function doGfxMouseMove(evt){
    var pt = getGfxMouse(evt);
    var geom;
    var shape;

    if(whiteboard.mouseDown){
      if((whiteboard.tool == 'pen') && pointInDrawing(pt) ){
        if((whiteboard.points[whiteboard.points.length - 1].x != pt.x) || (whiteboard.points[whiteboard.points.length - 1].y != pt.y)){
          whiteboard.points.push(pt);

          if(whiteboard.points.length > 1){
          //make sure its not the same point as last time

            geom = createGeom.line(
                {x1: whiteboard.points[whiteboard.points.length - 2].x,
                y1: whiteboard.points[whiteboard.points.length - 2].y,
                x2: whiteboard.points[whiteboard.points.length - 1].x,
                y2: whiteboard.points[whiteboard.points.length - 1].y },
                whiteboard.lineColor, whiteboard.lineStroke
            );
            drawFromJSON(geom,whiteboard.overlayDrawing);
          }

        }
      }else{
        var bounds = {x1:whiteboard.mouseDownPt.x, y1:whiteboard.mouseDownPt.y, x2: pt.x, y2: pt.y};
        if(whiteboard.tool != 'pen'){
          whiteboard.overlayDrawing.clear();
        }

        if(whiteboard.tool == 'rect'){
          geom  = createGeom.rect(bounds, whiteboard.lineColor, whiteboard.lineStroke);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'filledRect'){
          geom  = createGeom.rect(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'ellipse'){
          geom  = createGeom.ellipse(bounds, whiteboard.lineColor, whiteboard.lineStroke);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'filledEllipse'){
          geom  = createGeom.ellipse(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'line'){
          geom  = createGeom.line(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }else if(whiteboard.tool == 'move'){
          if(whiteboard.selectedShape && whiteboard.mouseDownPt)
          {
            geom = createGeom.moveOverlay(whiteboard.selectedShape.wbbb);
            drawFromJSON(geom,whiteboard.overlayDrawing);
            var offBB = createOffsetBB(whiteboard.selectedShape.wbbb,whiteboard.mouseDownPt,pt);
            var geom2 = createGeom.moveOverlay(offBB);

            drawFromJSON(geom2,whiteboard.overlayDrawing);
          }
        }

      }
    } else {
      if(whiteboard.tool == 'move'){
        whiteboard.overlayDrawing.clear();
        shape = getHoveredShape(whiteboard.drawing,pt);
        if(shape){
          geom = createGeom.moveOverlay(shape.wbbb);
          drawFromJSON(geom,whiteboard.overlayDrawing);
        }
      }
    }

    //mouse up or down doesn't matter for the select and delete tools
    if(whiteboard.tool == 'delete'){
      whiteboard.overlayDrawing.clear();
      shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.deleteOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }else if(whiteboard.tool == 'moveUp'){
      whiteboard.overlayDrawing.clear();
      shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.moveUpOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }else if(whiteboard.tool == 'moveDown'){
      whiteboard.overlayDrawing.clear();
      shape = getHoveredShape(whiteboard.drawing,pt);
      if(shape){
        geom = createGeom.moveDownOverlay(shape.wbbb);
        drawFromJSON(geom,whiteboard.overlayDrawing);
      }
    }
  };

});