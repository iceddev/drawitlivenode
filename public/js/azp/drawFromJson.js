define([
  './getBoundingBox',
  './moveShape',
  './removeShape',
  './moveShapeUp',
  './moveShapeDown'
], function(getBoundingBox, moveShape, removeShape, moveShapeUp, moveShapeDown){

  'use strict';

  return function drawFromJSON(geom, drawing){
    if(geom && geom.shapeType){
      var shape;
      var stroke = {color: geom.lineColor, width: geom.lineStroke};
      if(geom.shapeType == 'rect'){
        shape = drawing.createRect({x: geom.xPts[0], y: geom.yPts[0], width: (geom.xPts[1] - geom.xPts[0]), height: (geom.yPts[1] - geom.yPts[0]) });
      }
      else if(geom.shapeType == 'image'){
        var imgData = geom.dataStr;
        if(imgData){
          shape =  drawing.createImage({src:imgData,x: geom.xPts[0], y: geom.yPts[0], width: (geom.xPts[1] - geom.xPts[0]), height: (geom.yPts[1] - geom.yPts[0]) });
        }

      }
      else if(geom.shapeType == 'line'){
        shape = drawing.createLine({x1: geom.xPts[0], y1: geom.yPts[0], x2: geom.xPts[1], y2: geom.yPts[1]});
        stroke.cap = 'round';
      }
      else if(geom.shapeType == 'text'){

        shape = drawing.createText({ x:geom.xPts[0], y:geom.yPts[0] + geom.lineStroke, text:geom.text});
        shape.setFont({ size:(geom.lineStroke + "pt"), weight:"normal", family:"Arial" });
        shape.setFill(geom.lineColor);
        var width = shape.getTextWidth(geom.text);
        shape.wbbb = {
          x1: geom.xPts[0],
          y1: geom.yPts[0],
          x2: (geom.xPts[0] + width),
          y2: geom.yPts[0] + geom.lineStroke
        };


      }
      else if(geom.shapeType == 'ellipse'){

        shape = drawing.createEllipse({cx: ((geom.xPts[1] - geom.xPts[0])/2) + geom.xPts[0],
           cy: ((geom.yPts[1] - geom.yPts[0])/2) + geom.yPts[0],
           rx: (geom.xPts[1] - geom.xPts[0])/2,
           ry: (geom.yPts[1] - geom.yPts[0])/2 });
      }
      else if(geom.shapeType == 'pen'){
        if(geom.xPts){
          if(geom.xPts.length > 1){
            //console.log("num pen points drawing:",geom.xPts.length);
            shape = drawing.createGroup();

            for(var i = 0; i < (geom.xPts.length - 1); i++){

              var lineShape = drawing.createLine({x1: geom.xPts[i], y1: geom.yPts[i], x2: geom.xPts[i + 1], y2: geom.yPts[i + 1]});
              stroke.cap = 'round';
              lineShape.setStroke(stroke);

              shape.add(lineShape);
            }
          }
        }
      }else if(geom.shapeType == 'clear'){
        drawing.clear();
      }else if(geom.shapeType == 'delete'){
        removeShape(geom,drawing);
      }else if(geom.shapeType == 'move'){
        moveShape(geom,drawing);
      }else if(geom.shapeType == 'moveUp'){
        moveShapeUp(geom,drawing);
      }else if(geom.shapeType == 'moveDown'){
        moveShapeDown(geom,drawing);
      }
      else if(geom.shapeType == 'select'){

        shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
        shape.setStroke({color: new dojo.Color([0,0,255,0.75]), width: 2});
        shape.setFill(new dojo.Color([0,0,255,0.25]));
        return shape;
      }else if(geom.shapeType == 'deleteOverlay'){

        shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
        shape.setStroke({color: new dojo.Color([255,0,0,0.75]), width: 2});
        shape.setFill(new dojo.Color([255,0,0,0.25]));

        var line = drawing.createLine({x1: geom.xPts[0] - 3, y1: geom.yPts[0] - 3, x2: geom.xPts[1] + 3, y2: geom.yPts[1] + 3});
        line.setStroke({color: "#FF0000", width: 2});

        line = drawing.createLine({x1: geom.xPts[1] + 3, y1: geom.yPts[0] - 3, x2: geom.xPts[0] - 3, y2: geom.yPts[1] + 3});
        line.setStroke({color: "#FF0000", width: 2});

        return shape;
      }else if(geom.shapeType == 'moveOverlay'){

        shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
        shape.setStroke({color: new dojo.Color([0,0,255,0.75]), width: 2});
        shape.setFill(new dojo.Color([0,0,255,0.25]));

        return shape;
      }else if(geom.shapeType == 'moveUpOverlay'){

        shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
        //shape.setStroke({color: new dojo.Color([0,0,255,0.75]), width: 2});
        shape.setFill(new dojo.Color([0,0,255,0.15]));

        var line = drawing.createLine({x1: geom.xPts[0] - 5, y1: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2), x2: geom.xPts[1] + 3, y2: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2)});
        line.setStroke({color: "#0000FF", width: 2});

        line = drawing.createLine({x1: geom.xPts[0] - 5, y1: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2), x2: geom.xPts[0] + ((geom.xPts[1] - geom.xPts[0]) / 2), y2: geom.yPts[0] -5});
        line.setStroke({color: "#0000FF", width: 2});

        line = drawing.createLine({x1: geom.xPts[0] + ((geom.xPts[1] - geom.xPts[0]) / 2), y1: geom.yPts[0] -5, x2: geom.xPts[1] + 5, y2: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2)});
        line.setStroke({color: "#0000FF", width: 2});


        return shape;
      }else if(geom.shapeType == 'moveDownOverlay'){

        shape = drawing.createRect({x: geom.xPts[0] - 3, y: geom.yPts[0] - 3, width: (geom.xPts[1] - geom.xPts[0] + 6), height: (geom.yPts[1] - geom.yPts[0] + 6) });
        //shape.setStroke({color: new dojo.Color([0,0,255,0.75]), width: 2});
        shape.setFill(new dojo.Color([0,0,255,0.15]));

        var line = drawing.createLine({x1: geom.xPts[0] - 5, y1: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2), x2: geom.xPts[1] + 3, y2: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2)});
        line.setStroke({color: "#0000FF", width: 2});

        line = drawing.createLine({x1: geom.xPts[0] - 5, y1: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2), x2: geom.xPts[0] + ((geom.xPts[1] - geom.xPts[0]) / 2), y2: geom.yPts[1] + 5});
        line.setStroke({color: "#0000FF", width: 2});

        line = drawing.createLine({x1: geom.xPts[0] + ((geom.xPts[1] - geom.xPts[0]) / 2), y1: geom.yPts[1] + 5, x2: geom.xPts[1] + 5, y2: geom.yPts[0] + ((geom.yPts[1] - geom.yPts[0]) / 2)});
        line.setStroke({color: "#0000FF", width: 2});

        return shape;
      }

      if(shape){

        shape.cRand = geom.cRand;
        shape.cTime = geom.cTime;
        if(!shape.wbbb){
          shape.wbbb = getBoundingBox(geom);
        }
        shape.fromUser = geom.fromUser;

        if(geom.filled && shape.setFill){
          shape.setFill(geom.fillColor);
        }
        if(shape.setStroke && (geom.shapeType != 'text')){
          shape.setStroke(stroke);
        }
      }

      return shape;
    }
  };

});