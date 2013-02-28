define([

], function(){
  return {
    //first point should be upper left of rect
     normalizeBounds : function(bounds){
      if(bounds.x2 < bounds.x1){
        var tempX1 = bounds.x1;
        bounds.x1 = bounds.x2;
        bounds.x2 = tempX1;
      }
      if(bounds.y2 < bounds.y1){
        var tempY1 = bounds.y1;
        bounds.y1 = bounds.y2;
        bounds.y2 = tempY1;
      }
      return bounds;
    },
    addTimeRand : function(geom){
      geom.cTime = new Date().getTime();
      geom.cRand = Math.round(100000000000 * Math.random());
      geom.fromUser = userName;
      return geom;
    }
  };
});