define([
  './wb/whiteboard',
  'lodash',
  'dijit/registry'
], function(whiteboard, _, registry){

  'use strict';

  return function showMovie(){
    try{
      registry.byId("movieDialog").show();

      if(messageList){
        whiteboard.geomMessageList = [];
        _.forEach(messageList,function(m){
          if(m.geometry){
            whiteboard.geomMessageList.push(m);
          }
        });
      }
      var mSlider = registry.byId('movieSlider');
      mSlider.setAttribute('maximum', whiteboard.geomMessageList.length);
      mSlider.setAttribute('discreteValues', whiteboard.geomMessageList.length);

      mSlider.setValue(0);
    }catch(e){
      console.info("canvas not supported",e);
    }
  };

});