define([
  './sendMessage',
  './drawFromJson',
  './getGfxMouse',
  './getHoveredShape',
  './pointInDrawing',
  './wb/whiteboard',
  './wb/create-json',
  'dijit/registry'
], function(sendMessage, drawFromJSON, getGfxMouse, getHoveredShape, pointInDrawing, whiteboard, createGeom, registry){

  'use strict';

  return function doGfxMouseUp(evt) {
    var pt = getGfxMouse(evt);
    whiteboard.mouseDown = false;
    var shape;

    //always clear the overlay
    whiteboard.overlayDrawing.clear();

    if(whiteboard.mouseDownPt){
      //make sure mouse was released inside of drawing area
      if(pointInDrawing(pt)){

        var bounds = {x1:whiteboard.mouseDownPt.x, y1:whiteboard.mouseDownPt.y, x2: pt.x, y2: pt.y};

        var geom = null;
        if(whiteboard.tool == 'rect'){
          geom  = createGeom.rect(bounds, whiteboard.lineColor, whiteboard.lineStroke);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'filledRect'){
          geom  = createGeom.rect(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'ellipse'){
          geom  = createGeom.ellipse(bounds, whiteboard.lineColor, whiteboard.lineStroke);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'filledEllipse'){
          geom  = createGeom.ellipse(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'line'){
          geom  = createGeom.line(bounds, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.drawing);
        }else if(whiteboard.tool == 'pen'){
          geom = createGeom.pen(whiteboard.points, whiteboard.lineColor, whiteboard.lineStroke, whiteboard.fillColor);
          drawFromJSON(geom,whiteboard.drawing);
          console.log("num pen points sending:",geom.xPts.length);
        }else if(whiteboard.tool == 'delete'){
          shape = getHoveredShape(whiteboard.drawing,pt);
          if(shape){
            geom = createGeom.deleteGeom(shape);
            drawFromJSON(geom,whiteboard.drawing);
          }
        }else if(whiteboard.tool == 'move'){
          if(whiteboard.selectedShape && whiteboard.mouseDownPt){
            var ptDelta = {x: (pt.x - whiteboard.mouseDownPt.x),y: (pt.y - whiteboard.mouseDownPt.y)};

            geom = createGeom.move(whiteboard.selectedShape, ptDelta);

            drawFromJSON(geom,whiteboard.drawing);
          }

        }else if(whiteboard.tool == 'moveUp'){
          shape = getHoveredShape(whiteboard.drawing,pt);
          if(shape){
            geom = createGeom.moveUp(shape);
            drawFromJSON(geom,whiteboard.drawing);
          }
        }else if(whiteboard.tool == 'moveDown'){
          shape = getHoveredShape(whiteboard.drawing,pt);
          if(shape){
            geom = createGeom.moveDown(shape);
            drawFromJSON(geom,whiteboard.drawing);
          }
        }else if(whiteboard.tool == 'text'){
          whiteboard.textPoint = pt;
          registry.byId('textDialog').show();
        }

        if(geom){
          sendMessage({geometry:geom});
        }

      }else{
        whiteboard.mouseDownPt = null;
        console.log("mouse released outside of drawing area");
      }
    }

    //clear everything
    whiteboard.mouseDownPt = null;
    whiteboard.selectedShape = null;
    whiteboard.points = [];
  };

});