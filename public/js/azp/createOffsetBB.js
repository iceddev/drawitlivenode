define(function(){

  'use strict';

  return function createOffsetBB(origBB, pointInBB, newPt){
    var xDelta = Math.abs(pointInBB.x - origBB.x1);
    var yDelta = Math.abs(pointInBB.y - origBB.y1);

    var bounds = {
      x1: (newPt.x - xDelta),
      y1: (newPt.y - yDelta)
    };

    bounds.x2 = bounds.x1 + (origBB.x2 - origBB.x1);
    bounds.y2 = bounds.y1 + (origBB.y2 - origBB.y1);

    return bounds;
  };

});