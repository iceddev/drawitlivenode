define([
  './printChatMessage',
  './drawFromJson',
  './populateUserList',
  './animateUserItem',
  './wb/whiteboard'
], function(printChatMessage, drawFromJSON, populateUserList, animateUserItem, whiteboard){

  'use strict';

  return function onMessage(obj) {
    console.log("onMessage", obj);

    if(obj.chatMessage){
      printChatMessage(obj);
    }
    if(obj.geometry && obj.geometry.shapeType){
      obj.geometry.fromUser = obj.fromUser;
      if(obj.fromUser != userName){
        drawFromJSON(obj.geometry,whiteboard.drawing);
      }
    }

    // if(obj.chatMessage || obj.geometry){
    //   messageList.push(obj);
    // }

    if(obj.userList && (obj.userList.length > 0)){
      populateUserList(obj.userList);
    }

    if(obj.fromUser){
      animateUserItem(obj.fromUser);
    }
  };

});