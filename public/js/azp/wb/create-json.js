define([
  './utils'
], function(utils){
  return {
    rect : function(bounds, lineColor, lineStroke, fillColor){
      bounds = utils.normalizeBounds(bounds);
      var geom = {
          xPts: [bounds.x1,bounds.x2],
          yPts: [bounds.y1,bounds.y2]
      };
      geom.shapeType = 'rect';
      if(fillColor){
        geom.fillColor = fillColor;
        geom.filled = true;
      }else{
        geom.filled = false;
      }
      geom.lineColor = lineColor;
      geom.lineStroke = lineStroke;

      return utils.addTimeRand(geom);
    },

    image:  function(bounds, textData){
      bounds = utils.normalizeBounds(bounds);
      var geom = {
          xPts: [bounds.x1,bounds.x2],
          yPts: [bounds.y1,bounds.y2],
          shapeType: 'image'
      };
      geom.dataStr = textData;

      return utils.addTimeRand(geom);
    },

    select : function(bounds){
      bounds = utils.normalizeBounds(bounds);
      var geom = {
          xPts: [bounds.x1,bounds.x2],
          yPts: [bounds.y1,bounds.y2]
      };
      geom.shapeType = 'select';
      return geom;
    },

    text : function(pt, text, fontSize, lineColor){
      var geom = {
          xPts: [pt.x],
          yPts: [pt.y]
      };
      geom.shapeType = 'text';
      geom.text = text;
      geom.lineStroke = fontSize;
      geom.lineColor = lineColor;

      return utils.addTimeRand(geom);
    },


    deleteOverlay : function(bounds){
      bounds = utils.normalizeBounds(bounds);
      var geom = {
          xPts: [bounds.x1,bounds.x2],
          yPts: [bounds.y1,bounds.y2]
      };
      geom.shapeType = 'deleteOverlay';
      return geom;
    },

    moveOverlay : function(bounds){
      bounds = utils.normalizeBounds(bounds);
      var geom = {
          xPts: [bounds.x1,bounds.x2],
          yPts: [bounds.y1,bounds.y2]
      };
      geom.shapeType = 'moveOverlay';
      return geom;
    },

    moveUpOverlay : function(bounds){
      var geom = this.moveOverlay(bounds);
      geom.shapeType = 'moveUpOverlay';
      return geom;
    },

    moveDownOverlay : function(bounds){
      var geom = this.moveOverlay(bounds);
      geom.shapeType = 'moveDownOverlay';
      return geom;
    },

    move : function(shape, ptDelta){

      var geom = {
          xPts: [ptDelta.x],
          yPts: [ptDelta.y]
      };
      geom.shapeType = 'move';
      geom.cTime = shape.cTime;
      geom.cRand = shape.cRand;
      geom.fromUser = shape.fromUser;
      return geom;
    },


    moveUp : function(shape,ptDelta){

      var geom = {};
      geom.shapeType = 'moveUp';
      geom.cTime = shape.cTime;
      geom.cRand = shape.cRand;
      geom.fromUser = shape.fromUser;
      return geom;
    },

    moveDown : function(shape,ptDelta){

      var geom = {};
      geom.shapeType = 'moveDown';
      geom.cTime = shape.cTime;
      geom.cRand = shape.cRand;
      geom.fromUser = shape.fromUser;
      return geom;
    },

    deleteGeom : function(shape){

        var geom = {};
        geom.shapeType = 'delete';
        geom.cTime = shape.cTime;
        geom.cRand = shape.cRand;
        geom.fromUser = shape.fromUser;
        return geom;
    },

    ellipse : function(bounds, lineColor, lineStroke, fillColor){
      bounds = utils.snormalizeBounds(bounds);
      var geom = {
          xPts: [bounds.x1,bounds.x2],
          yPts: [bounds.y1,bounds.y2]
      };
      geom.shapeType = 'ellipse';
      if(fillColor){
        geom.fillColor = fillColor;
        geom.filled = true;
      }else{
        geom.filled = false;
      }
      geom.lineColor = lineColor;
      geom.lineStroke = lineStroke;

      return utils.addTimeRand(geom);
    },

    line : function(bounds, lineColor, lineStroke){
      var geom = {
          xPts: [bounds.x1,bounds.x2],
          yPts: [bounds.y1,bounds.y2]
      };
      geom.shapeType = 'line';
      geom.lineColor = lineColor;
      geom.lineStroke = lineStroke;

      return utils.addTimeRand(geom);
   },

   pen : function(points , lineColor, lineStroke, fillColor){
      var xPts = [];
      var yPts = [];
      dojo.forEach(points, function(point){
       xPts.push(point.x);
       yPts.push(point.y);
      });
      var geom = {shapeType: 'pen',
            xPts: xPts,
            yPts: yPts
      };
      if(fillColor){
        geom.fillColor = fillColor;
        geom.filled = true;
      }else{
        geom.filled = false;
      }
      geom.lineColor = lineColor;
      geom.lineStroke = lineStroke;

      return utils.addTimeRand(geom);
  },

  clearDrawing : function(){
    var geom = {shapeType: 'clear'};
    return geom;
  }


  };

});
