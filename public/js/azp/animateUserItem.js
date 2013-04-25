define([
  'dojo/dom',
  'dojo/_base/fx'
], function(dom, fx){

  'use strict';

  return function animateUserItem(user){
    try{
      var userNode = dom.byId("userListItem" + user);
      if(userNode){
        fx.animateProperty({
          node: userNode,
          duration: 750,
          properties: {
            backgroundColor: {
              start: "red",
              end: "white"
            },
            color: {
              start: "white",
              end: "black"
            }
          }
        }).play();
      }
    }catch(e){
      console.info("couldn\'t animate " + user, e);
    }
  };

});